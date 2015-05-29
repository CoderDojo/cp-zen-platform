'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'user';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'encrypt_password'}, proxy);
  seneca.add({role: plugin, cmd: 'verify_password'}, proxy);
  seneca.add({role: plugin, cmd: 'change_password'}, proxy);
  seneca.add({role: plugin, cmd: 'register'}, proxy);
  seneca.add({role: plugin, cmd: 'login'}, proxy);
  seneca.add({role: plugin, cmd: 'confirm'}, proxy);
  seneca.add({role: plugin, cmd: 'auth'}, proxy);
  seneca.add({role: plugin, cmd: 'logout'}, proxy);
  seneca.add({role: plugin, cmd: 'clean'}, proxy);
  seneca.add({role: plugin, cmd: 'create_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'load_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'execute_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'update'}, proxy);
  seneca.add({role: plugin, cmd: 'enable'}, proxy);
  seneca.add({role: plugin, cmd: 'disable'}, proxy);
  seneca.add({role: plugin, cmd: 'delete'}, proxy);

  function proxy(args, done) {
    var user = {};
    if(args.req$) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: plugin}
    ), done);
  }

/*  seneca.act({ role: 'web', use: {
    prefix: options.prefix+version+'/users',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'list': {POST: true, alias: 'list'},
      'register': {POST: true, alias: 'register'},
      'promote': {PUT: true, alias: 'promote/:id'},
      'get_users_by_emails': {POST: true, alias: 'emails'}
    }
  }});*/

  return {
    name: plugin
  }

};