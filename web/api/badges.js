'use strict';

var _ = require('lodash');
var auth = require('../lib/authentications');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-badges');

  server.route([{
    method: 'GET',
    path: options.basePath + '/badges',
    handler: handlers.actHandler('listBadges'),
    config: {
      description: 'List all possible badges',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/badges/{slug}',
    handler: handlers.actHandler('getBadge', 'slug'),
    config: {
      description: 'Get badge by slug',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/badges/applications',
    handler: handlers.actHandlerNeedsUser('sendBadgeApplication'),
    config: {
      auth: auth.apiUser,
      description: 'Create badge application',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/badges/accept',
    handler: handlers.actHandlerNeedsUser('acceptBadge'),
    config: {
      auth: auth.apiUser,
      description: 'Accept badge',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/badges/user/{userId}',
    handler: handlers.actHandlerNeedsUser('loadUserBadges', 'userId'),
    config: {
      auth: auth.apiUser,
      description: 'Load user badges',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/badges/categories',
    handler: handlers.actHandler('loadBadgeCategories'),
    config: {
      description: 'List badges categories',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/badges/code',
    handler: handlers.actHandlerNeedsUser('loadBadgeByCode'),
    config: {
      auth: auth.apiUser,
      description: 'Get Badge by Id',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/badges/claim',
    handler: handlers.actHandlerNeedsUser('claimBadge'),
    config: {
      auth: auth.apiUser,
      description: 'Request a badge',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/badges/export',
    handler: handlers.actHandlerNeedsUser('exportBadges'),
    config: {
      auth: auth.apiUser,
      description: 'Export User\'s badges',
      tags: ['api', 'users']
    }
  }, /* {  // TODO - this looks like it's not used - safe to remove?
    method: 'GET',
    path: options.basePath + '/verify_badge/{userId}/{badgeId}/assertion',
    handler: handlers.actHandlerNeedsUser('verifyBadge', ['userId', 'badgeId'])
  }, */{
    method: 'GET',
    path: options.basePath + '/badges/kpi/number-of-badges-awarded',
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesAwarded'),
    config: {
      auth: auth.apiUser,
      description: 'Number of badges awarded',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/badges/kpi/number-of-badges-published',
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesPublished'),
    config: {
      auth: auth.apiUser,
      description: 'Number of existing badges',
      tags: ['api', 'users']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-badges',
  dependencies: 'cd-auth',
};
