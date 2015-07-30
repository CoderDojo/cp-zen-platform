'use strict';

var _ = require('lodash');
var pkg = require('./package');

module.exports = function (options) {
  var seneca = this;
  var server = options.server;

  seneca.add({ role: 'web', hapi: true }, function (args, done) {
    // Adds a utility method to map seneca actions to Hapi routes, 
    // utilizing Hapi server methods + cache where applicable.

    // { role: 'web', use: {
    //   prefix: options.prefix + version + '/',
    //   pin: { role: plugin, cmd: '*' },
    //   map: {
    //     'search': {POST: true, alias: 'dojos/search'},
      
    var use = args.use;
    var prefix = use.prefix;
    var role = use.pin.role;
    var methodNamePrefix = role.replace('-', '_') + '_';

    _.each(use.map, function (mapping, cmd) {
      var name =  methodNamePrefix + cmd;
      var expiresIn = mapping.expiresIn;
      var actionOptions = {};
      var routeCacheOptions = {};
      var methods = _.chain(mapping)
        .filter(_.identity)
        .keys()
        .filter(function (key) {
          if (key === 'GET') return true;
          if (key === 'POST') return true;
          if (key === 'PUT') return true;
          if (key === 'DELETE') return true;
          return false;
        })
        .value();

      if (expiresIn > 0) {
        _.set(actionOptions, 'cache.cache', 'cd-cache');
        _.set(actionOptions, 'cache.expiresIn', expiresIn);
        _.set(routeCacheOptions, 'expiresIn', expiresIn);
      }

      // Add a Hapi server method for the seneca action.
      server.action(name, action, actionOptions);

      // Map a route to the hapi server method for the action.
      server.register({
        method: methods,
        path: prefix + (mapping.alias || cmd),
        cache: routeCacheOptions,
        handler: function (request, reply) {
          var user = _.get(seneca, 'login.user', {});
          var args = seneca.util.argprops(
            { user: user },
            args, // TODO build from request query, params, etc.
            { role: plugin }
          ));
          var serverMethod = _.get(server, ['methods', name]);
          // TODO make sure hapi-etags is working to add etag and check max-age
          var serverMethodWithArgs = _.bind(serverMethod, server, args, function (error, result) { 
            if (error) return reply(error);
            reply(result);
          });

          serverMethodWithArgs();
        });
      });
    });
  });

  return { name: pkg.name };
};
