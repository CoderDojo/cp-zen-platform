'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'cd-users';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'get_emails'}, proxy);
  seneca.add({role: plugin, cmd: 'register_user'}, proxy);

  function proxy(args, done) {
    var user = {};
    if(args.req$) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: plugin}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix+version+'/users',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'get_emails': {POST: true, alias: 'emails'},
      'register_user': {POST: true, alias: 'register'}
    }
  }});

  return {
    name: plugin
  }

};