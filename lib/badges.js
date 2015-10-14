'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-badges');

  server.route([{
    method: 'GET',
    path: options.basePath + '/badges',
    handler: handlers.actHandler('listBadges')
  }, {
    method: 'GET',
    path: options.basePath + '/badges/{slug}',
    handler: handlers.actHandler('getBadge')
  }, {
    method: 'POST',
    path: options.basePath + '/badges/applications',
    handler: handlers.actHandlerNeedsUser('sendBadgeApplication')
  }, {
    method: 'POST',
    path: options.basePath + '/badges/accept',
    handler: handlers.actHandlerNeedsUser('acceptBadge')
  }, {
    method: 'GET',
    path: options.basePath + '/badges/user/{userId}',
    handler: handlers.actHandlerNeedsUser('loadUserBadges', 'userId')
  }, {
    method: 'GET',
    path: options.basePath + '/badges/categories',
    handler: handlers.actHandler('loadBadgeCategories')
  }, {
    method: 'POST',
    path: options.basePath + '/badges/code',
    handler: handlers.actHandlerNeedsUser('loadBadgeByCode')
  }, {
    method: 'GET',
    path: options.basePath + '/badges/claim',
    handler: handlers.actHandlerNeedsUser('claimBadge')
  }, {
    method: 'GET',
    path: options.basePath + '/badges/export',
    handler: handlers.actHandlerNeedsUser('exportBadges')
  }, /*{  // TODO - this looks like it's not used - safe to remove?
    method: 'GET',
    path: options.basePath + '/verify_badge/{userId}/{badgeId}/assertion',
    handler: handlers.actHandlerNeedsUser('verifyBadge', ['userId', 'badgeId'])
  }, */{
    method: 'GET',
    path: options.basePath + 'badges/kpi/number-of-badges-awarded',
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesAwarded')
  }, {
    method: 'GET',
    path: options.basePath + 'badges/kpi/number-of-badges-published',
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesPublished')
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-badges'
};
