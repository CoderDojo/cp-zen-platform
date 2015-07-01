'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'cd-users';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'register'}, proxy);
  seneca.add({role: plugin, cmd: 'promote'}, proxy);
  seneca.add({role: plugin, cmd: 'get_users_by_emails'}, proxy);
  seneca.add({role: plugin, cmd: 'update'}, proxy);
  seneca.add({role: plugin, cmd: 'load'}, proxy);
  seneca.add({role: plugin, cmd: 'authorize'}, proxy);
  seneca.add({role: plugin, cmd: 'get_init_user_types'}, proxy);
  seneca.add({role: plugin, cmd: 'token'}, proxy);
  seneca.add({role: plugin, cmd: 'userprofile'}, proxy);

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
      'list': {POST: true, alias: 'list'},
      'register': {POST: true, alias: 'register'},
      'promote': {PUT: true, alias: 'promote/:id'},
      'get_users_by_emails': {POST: true, alias: 'emails'},
      'update': {PUT: true, alias: 'update/:id'},
      'load': {GET: true, alias: 'load/:id'},
      'authorize': {GET: true, alias: 'authorize'},
      'get_init_user_types': {GET: true, alias: 'init_user_types'},
      'token': {POST: true, alias: 'token'},
      'userprofile': {GET: true, alias: 'userprofile'}
    }
  }});

  return {
    name: plugin
  }

};