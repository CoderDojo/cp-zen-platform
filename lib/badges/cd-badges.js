'use strict';

module.exports = function(options) {
  var seneca = this;
  var plugin = 'badges';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, cmd: 'listBadges'}, proxy);
  seneca.add({ role: plugin, cmd: 'getBadge'}, proxy);

  function proxy(args, done) {
    var user = {};
    if (args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user: user},
      args, 
      {role: 'cd-badges'}
    ), done);
  }

  seneca.act('role:web', { use: { 
    prefix: options.prefix + version, 
    pin: { role: plugin, cmd: '*' },
    map: {
      'listBadges': { GET: true, alias: 'badges' },
      'getBadge': { GET: true, alias: 'badges/:slug' }
    }
  }});

  return {
      name: plugin
  }
};
