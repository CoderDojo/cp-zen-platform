'use strict';
var _ = require('lodash');

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
  seneca.add({role: plugin, cmd: 'get_init_user_types'}, proxy);

  function proxy(args, done) {
    var user = null;
    if(args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user: user},
      args,
      {role: 'cd-users'}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/users',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'list': {POST: true, alias: 'list'},
      'register': {POST: true, alias: 'register'},
      'promote': {PUT: true, alias: 'promote/:id'},
      'get_users_by_emails': {POST: true, alias: 'emails'},
      'update': {PUT: true, alias: 'update/:id'},
      'load': {GET: true, alias: 'load/:id'},
      'get_init_user_types': {GET: true, alias: 'init_user_types'}
    }
  }});

  return {
    name: plugin
  }

};