'use strict';

var _ = require('lodash');
var pkg = require('./package');

var plugin = pkg.name;

module.exports.register = function (server, options, next) {
  // Intercept role:web,use:... to add Hapi caching.
  server.seneca.add({ role: 'web' }, function (args, done) {
    var seneca = this;
    var use = args.use;

    function skipRewrite () {
      var skipArgs = seneca.util.argprops(
        { fatal$: false },
        args,
        { role: args.role, cmd: args.cmd });

      seneca.parent(skipArgs, done);
    }

    // Only intercept patterns with the use arg.
    if (!use) return skipRewrite();
    // Don't intercept when called with Express middleware.
    if (typeof use === 'function') return skipRewrite();
    // For some reason setting up a proxy for /auth does not work.  
    // TODO // Maybe because it uses { POST: function () {...} } or some other option. 
    if (use.prefix === '/auth') return skipRewrite();

    var rewrittenMappingArgs = seneca.util.argprops({}, _.cloneDeep(args), {});
    var role = use.pin.role;
    var namePrefix = role.replace(/[-]/g, '_') + '_';
 
    // Overwrite the mapping role to use our proxied seneca actions.
    rewrittenMappingArgs.use.pin.role = plugin;

    // Recreate the mappings so the cmd names point to our proxied actions.
    rewrittenMappingArgs.use.map = {};
    _.each(use.map, function (mapping, cmd) {
      var name = namePrefix + cmd.replace(/[-]/g, '_');
      rewrittenMappingArgs.use.map[name] = mapping;

      var cache;

      if (mapping.exipresIn) {
        cache = server.cache({
          cache: 'cd-cache',
          expiresIn: mapping.expiresIn,
          segment: 'chairo_cache_' + name,
          generateFunc: function (key, next) {
            seneca.act(key, next);
          }
        });
      }
  
      // Create a proxy seneca action that checks the Hapi cache.
      seneca.add({ role: plugin, cmd: name }, function (args, done) {
        // TODO // make sure etag header is present from hapi-etag
        // TODO // make sure cache-control info is compatible with etag
        var proxiedActionArgs = seneca.util.argprops(
          {fatal$: false, req$: args.req$, res$: args.res$ },
          args,
          { role: role, cmd: cmd });

        if (cache) {
          return cache.get(proxiedActionArgs, done);
        }

        return seneca.act(proxiedActionArgs, done);
      });
    });
 
    seneca.parent(rewrittenMappingArgs, done); 
  });

  next();
};

module.exports.register.attributes = { pkg: pkg };
