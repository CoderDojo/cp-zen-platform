'use strict';

var _ = require('lodash');
var pkg = require('./package');

module.exports.register = function (server, options, next) {
  var seneca = server.seneca;

  // Add using seneca.use so that the plugin name is registered with seneca.
  seneca.use(function () {
    // Intercept role:web,use:... to add Hapi caching.
    seneca.add({ role: 'web' }, function (args, done) {
      // Adds a utility method to map seneca actions to Hapi routes, 
      // utilizing Hapi server methods + cache where applicable.

      // { role: 'web', use: {
      //   prefix: options.prefix + version + '/',
      //   pin: { role: plugin, cmd: '*' },
      //   map: {
      //     'search': {POST: true, alias: 'dojos/search'},
      var use = args.use;

      // Only intercept patterns with the use arg.
      if (!use) return this.parent(args, done);
      // Don't intercept when called with Express middleware.
      if (typeof use === 'function') return this.parent(args, done);

      var role = use.pin.role;
      var namePrefix = role.replace(/[-]/g, '_') + '_';

      _.each(use.map, function (mapping, cmd) {
        var name =  namePrefix + cmd.replace(/[-]/g, '_');
        var expiresIn = mapping.expiresIn;
        var action = { role: role, cmd: cmd, skipCache: true };
        var actionOptions = {};

        if (expiresIn > 0) {
          _.set(actionOptions, 'cache.cache', 'cd-cache');
          _.set(actionOptions, 'cache.expiresIn', expiresIn);
        }

        // Add a Hapi server method for the seneca action.  (Calls
        // the overidden seneca action with skipCache: true.)
        server.action(name, action, actionOptions);

        // Override the seneca command to call the server method.  
        // Allow skipping cache to avoid infinite recursion when 
        // called from the Hapi server method.
        seneca.add({ role: role, cmd: cmd }, function (args, done) {
          if (args.skipCache) return this.parent(args, done);
          // TODO make sure etag header is present from hapi-etag
          // TODO make sure cache-control info is compatible with etag
          server.methods[name](args, done);
        });
      });

      this.parent(args, done);
    });

    return { name: pkg.name };
  });

  next();
};

module.exports.register.attributes = { pkg: pkg };
