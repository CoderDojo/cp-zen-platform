

const _ = require('lodash');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');
const Joi = require('joi');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-badges');

  server.route([{
    method: 'GET',
    path: `${options.basePath}/badges`,
    handler: handlers.actHandler('listBadges'),
    config: {
      description: 'List all possible badges',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/badges/{slug}`,
    handler: handlers.actHandler('getBadge', 'slug'),
    config: {
      description: 'Get badge by slug',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/badges/applications`,
    handler: handlers.actHandlerNeedsUser('sendBadgeApplication'),
    config: {
      auth: auth.apiUser,
      description: 'Create badge application',
      tags: ['api', 'users'],
      validate: {
        payload: {
          applicationData: {
            user: Joi.object().required(),
            badge: Joi.object().required(),
            emailSubject: Joi.string().valid('You have been awarded a new CoderDojo digital badge!').required(),
            evidence: Joi.string().optional(),
          },
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/badges/accept`,
    handler: handlers.actHandlerNeedsUser('acceptBadge'),
    config: {
      auth: auth.apiUser,
      description: 'Accept badge',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/badges/user/{userId}`,
    handler: handlers.actHandlerNeedsUser('loadUserBadges', 'userId'),
    config: {
      auth: auth.apiUser,
      description: 'Load user badges',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/badges/categories`,
    handler: handlers.actHandler('loadBadgeCategories'),
    config: {
      description: 'List badges categories',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/badges/code`,
    handler: handlers.actHandlerNeedsUser('loadBadgeByCode'),
    config: {
      auth: auth.apiUser,
      description: 'Get Badge by Id',
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/badges/claim`,
    handler: handlers.actHandlerNeedsUser('claimBadge'),
    config: {
      auth: auth.apiUser,
      description: 'Request a badge',
      tags: ['api', 'users'],
      validate: {
        payload: {
          userId: Joi.string().guid().optional(),
          badge: Joi.object().required(),
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/badges/export`,
    handler: handlers.actHandlerNeedsUser('exportBadges'),
    config: {
      auth: auth.apiUser,
      description: 'Export User\'s badges',
      tags: ['api', 'users'],
    },
  }, /* {  // TODO - this looks like it's not used - safe to remove?
    method: 'GET',
    path: options.basePath + '/verify_badge/{userId}/{badgeId}/assertion',
    handler: handlers.actHandlerNeedsUser('verifyBadge', ['userId', 'badgeId'])
  }, */{
    method: 'GET',
    path: `${options.basePath}/badges/kpi/number-of-badges-awarded`,
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesAwarded'),
    config: {
      auth: auth.apiUser,
      description: 'Number of badges awarded',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/badges/kpi/number-of-badges-published`,
    handler: handlers.actHandlerNeedsCdfAdmin('kpiNumberOfBadgesPublished'),
    config: {
      auth: auth.apiUser,
      description: 'Number of existing badges',
      tags: ['api', 'users'],
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-badges',
  dependencies: 'cd-auth',
};
