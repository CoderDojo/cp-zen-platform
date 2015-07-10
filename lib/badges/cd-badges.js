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
  seneca.add({ role: plugin, cmd: 'sendBadgeApplication'}, proxy);
  seneca.add({ role: plugin, cmd: 'acceptBadge'}, proxy);
  seneca.add({ role: plugin, cmd: 'loadUserBadges'}, proxy);

  function proxy(args, done) {
    var user = {};
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
    if (args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user: user, zenHostname: zenHostname},
      args, 
      {role: 'cd-badges'}
    ), done);
  }

  seneca.act('role:web', { use: { 
    prefix: options.prefix + version, 
    pin: { role: plugin, cmd: '*' },
    map: {
      'listBadges': { GET: true, alias: 'badges' },
      'getBadge': { GET: true, alias: 'badges/:slug' },
      'sendBadgeApplication': {POST: true, alias: 'badges/applications' },
      'acceptBadge': {POST: true, alias: 'badges/accept'},
      'loadUserBadges': {GET: true, alias: 'badges/user/:userId'}
    }
  }});

  return {
      name: plugin
  }
};
