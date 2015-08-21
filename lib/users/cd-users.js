'use strict';

var cacheTimes = require('../../web/config/cache-times');

module.exports = function(options){
  var seneca = this;
  var plugin = 'users-proxy';
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
  seneca.add({role: plugin, cmd: 'is_champion'}, proxy);
  seneca.add({role: plugin, cmd: 'reset_password'}, proxy);
  seneca.add({role: plugin, cmd: 'execute_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'load_champions_for_user'}, proxy);
  seneca.add({role: plugin, cmd: 'load_dojo_admins_for_user'}, proxy);
  seneca.add({role: plugin, cmd: 'record_login'}, proxy);

  function proxy(args, done) {
    var user;
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
    var locality = (args.req$ && args.req$.cookies.NG_TRANSLATE_LANG_KEY && args.req$.cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, '')) || args.req$ && args.req$.headers['accept-language'];
    locality = formatLocaleCode(locality);
    if(args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user:user, zenHostname: zenHostname, locality: locality, fatal$: false},
      args,
      {role: 'cd-users'}
    ), done);
  }

  function formatLocaleCode(code) {
    return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
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
      'get_init_user_types': {GET: true, alias: 'init_user_types', expiresIn: cacheTimes.long},
      'is_champion': {POST: true, alias:'isChampion'},
      'reset_password': {POST: true, alias: 'reset_password'},
      'execute_reset': {POST: true, alias: 'execute_reset'},
      'load_champions_for_user': {GET: true, alias: 'champions_for_user/:userId'},
      'load_dojo_admins_for_user': {GET: true, alias: 'dojo_admins_for_user/:userId'},
      'record_login': {POST: true, alias: 'record_login'}
    }
  }});

  return {
    name: plugin
  }

};
