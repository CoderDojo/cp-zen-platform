'use strict';

var cacheTimes = require('../../web/config/cache-times');
var _ = require('lodash');
_.mixin(require('lodash-deep'));

module.exports = function (options) {
  var seneca = this;
  var plugin = 'users-proxy';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'register'}, proxy);
  seneca.add({role: plugin, cmd: 'promote'}, proxy);
  seneca.add({role: plugin, cmd: 'get_users_by_emails'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'load'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'get_init_user_types'}, proxy);
  seneca.add({role: plugin, cmd: 'is_champion'}, proxy);
  seneca.add({role: plugin, cmd: 'reset_password'}, proxy);
  seneca.add({role: plugin, cmd: 'execute_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'load_champions_for_user'}, proxy);
  seneca.add({role: plugin, cmd: 'load_dojo_admins_for_user'}, proxy);
  seneca.add({role: plugin, cmd: 'kpi_number_of_youths_registered'}, proxyNeedCDFAdmin);
  seneca.add({role: plugin, cmd: 'kpi_number_of_champions_and_mentors_registered'}, proxyNeedCDFAdmin);
  seneca.add({role: plugin, cmd: 'kpi_number_of_youth_females_registered'}, proxyNeedCDFAdmin);

  function proxy (args, done) {
    var user;
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
    var locality = (args.req$ && args.req$.cookies.NG_TRANSLATE_LANG_KEY && args.req$.cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, '')) || args.req$ && args.req$.headers['accept-language'];
    if (!locality) locality = 'en_US';
    locality = formatLocaleCode(locality);
    if (args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user: user, zenHostname: zenHostname, locality: locality, fatal$: false},
      args,
      {role: 'cd-users'}
    ), done);
  }

  function proxyNeedCDFAdmin (args, done) {
    if (!_.deepHas(args.req$, 'user.user') || !_.contains(args.req$.seneca.user.roles, 'cdf-admin')) return done(null, {ok: false, why: 'You must be a cdf admin to access this data'});
    return proxy(args, done);
  }

  function proxyNeedUser (args, done) {
    if (!_.deepHas(args.req$, 'user.user')) return done(null, {ok: false, why: 'Not logged in, please log in first.'});
    return proxy(args, done);
  }

  function formatLocaleCode (code) {
    return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/users',
    pin: {role: plugin, cmd: '*'},
    map: {
      'register': {POST: true, alias: 'register'},
      'promote': {PUT: true, alias: 'promote/:id'},
      'get_users_by_emails': {POST: true, alias: 'emails'},
      'load': {GET: true, alias: 'load/:id'},
      'get_init_user_types': {GET: true, alias: 'init_user_types', expiresIn: cacheTimes.long},
      'is_champion': {POST: true, alias: 'isChampion'},
      'reset_password': {POST: true, alias: 'reset_password'},
      'execute_reset': {POST: true, alias: 'execute_reset'},
      'load_champions_for_user': {GET: true, alias: 'champions_for_user/:userId'},
      'load_dojo_admins_for_user': {GET: true, alias: 'dojo_admins_for_user/:userId'},
      'kpi_number_of_youths_registered': {GET: true, alias: 'kpi/number_of_youths_registered'},
      'kpi_number_of_champions_and_mentors_registered': {GET: true, alias: 'kpi/number_of_champions_and_mentors_registered'},
      'kpi_number_of_youth_females_registered': {GET: true, alias: 'kpi/number_of_youth_females_registered'}
    }
  }});

  return {
    name: plugin
  };
};
