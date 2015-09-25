'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));

module.exports = function (options) {
  var seneca = this;
  var plugin = 'badges';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, cmd: 'listBadges' }, proxy);
  seneca.add({ role: plugin, cmd: 'getBadge' }, proxy);
  seneca.add({ role: plugin, cmd: 'sendBadgeApplication' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'acceptBadge' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'loadUserBadges' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'loadBadgeCategories' }, proxy);
  seneca.add({ role: plugin, cmd: 'loadBadgeByCode' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'claimBadge' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'exportBadges' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'verifyBadge' }, proxyNeedUser);
  seneca.add({ role: plugin, cmd: 'kpiNumberOfBadgesAwarded' }, proxyNeedCDFAdmin);
  seneca.add({ role: plugin, cmd: 'kpiNumberOfBadgesPublished' }, proxyNeedCDFAdmin);

  function proxy (args, done) {
    var user = {};
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
    var locality = (args.req$.cookies.NG_TRANSLATE_LANG_KEY && args.req$.cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, '')) || args.req$.headers['accept-language'];
    if (!locality) locality = 'en_US';
    locality = formatLocaleCode(locality);

    if (args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user: user, zenHostname: zenHostname, locality: locality, fatal$: false},
      args,
      {role: 'cd-badges'}
    ), done);
  }

  function proxyNeedUser (args, done) {
    if (!_.deepHas(args.req$, 'user.user')) return done(null, {ok: false, why: 'Not logged in, please log in first.'});
    return proxy(args, done);
  }

  function proxyNeedCDFAdmin (args, done) {
    if (!_.deepHas(args.req$, 'user.user') || !_.contains(args.req$.seneca.user.roles, 'cdf-admin')) return done(null, {ok: false, why: 'You must be a cdf admin to access this data'});
    return proxy(args, done);
  }

  function formatLocaleCode (code) {
    return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
  }

  seneca.act('role:web', {
    use: {
      prefix: options.prefix + version,
      pin: { role: plugin, cmd: '*' },
      map: {
        'listBadges': { GET: true, alias: 'badges' },
        'getBadge': { GET: true, alias: 'badges/:slug' },
        'sendBadgeApplication': { POST: true, alias: 'badges/applications' },
        'acceptBadge': {POST: true, alias: 'badges/accept'},
        'loadUserBadges': {GET: true, alias: 'badges/user/:userId'},
        'loadBadgeCategories': {GET: true, alias: 'badge_categories'},
        'loadBadgeByCode': {POST: true, alias: 'badges/code'},
        'claimBadge': {POST: true, alias: 'badges/claim'},
        'exportBadges': {GET: true, alias: 'export_badges'},
        'verifyBadge': {GET: true, alias: 'verify_badge/:userId/:badgeId/assertion'},
        'kpiNumberOfBadgesAwarded': {GET: true, alias: 'badges/kpi/number_of_badges_awarded'},
        'kpiNumberOfBadgesPublished': {GET: true, alias: 'badges/kpi/number_of_badges_published'}
      }
    }
  });

  return {
    name: plugin
  };
};
