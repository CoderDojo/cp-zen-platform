'use strict';

var _ = require('lodash');
var pkg = require('./package');

module.exports = function (options) {
  var seneca = this;
  var server = seneca.server;

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

    // Don't intercept when called with Express middleware.
    if (typeof use === 'function') return this.parent(args, done);

    var role = use.pin.role;
    var namePrefix = role.replace('-', '_') + '_';

    _.each(use.map, function (mapping, cmd) {
      var name =  namePrefix + cmd;
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
        server.methods[name](args, done);
      });
    });

    this.parent(args, done);
  });

  return { name: pkg.name };
};
