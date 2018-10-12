

const _ = require('lodash');
const auth = require('../lib/authentications');
const Joi = require('joi');
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-organisations');

  server.route([{
    method: 'GET',
    path: `${options.basePath}/organisations`,
    handler: handlers.actHandler('list', null, null, { ctrl: 'org' }),
    config: {
      auth: auth.apiUser,
      description: 'List all possible organisations',
      tags: ['api', 'organisation'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/organisations/{id}`,
    handler: handlers.actHandler('load', ['id'], null, { ctrl: 'org' }),
    config: {
      auth: auth.apiUser,
      description: 'Get organisation by id',
      tags: ['api', 'organisation'],
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/organisations`,
    handler: handlers.actHandlerNeedsUser('create', null, null, { ctrl: 'org' }),
    config: {
      auth: auth.apiUser,
      description: 'Create organisation',
      tags: ['api', 'organisation'],
      validate: {
        payload: {
          org: {
            name: Joi.string().required(),
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${options.basePath}/organisations/{orgId}/users`,
    handler: handlers.actHandlerNeedsUser('list', ['orgId'], null, { ctrl: 'userOrg' }),
    config: {
      auth: auth.apiUser,
      description: 'Load organisation\'s users',
      tags: ['api', 'organisation'],
      validate: {
        params: {
          orgId: Joi.string().required(),
        },
      },
    },
  }, { method: 'GET',
    path: `${options.basePath}/user/{userId}/organisations`,
    handler: handlers.actHandlerNeedsUser('list', ['userId'], null, { ctrl: 'userOrg' }),
    config: {
      auth: auth.apiUser,
      description: 'Load user\'s organisation\'s',
      tags: ['api', 'organisation'],
      validate: {
        params: {
          userId: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/users/organisations`,
    handler: handlers.actHandlerNeedsCdfAdmin('list', null, { ctrl: 'userOrg' }),
    config: {
      auth: auth.apiUser,
      description: 'Load organisation\'s users',
      tags: ['api', 'organisation'],
      validate: {
        payload: {
          userIds: Joi.array().items(Joi.string().guid()),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/organisations/{orgId}/users`,
    handler: handlers.actHandlerNeedsUser('create', ['orgId'], null, { ctrl: 'userOrg' }),
    config: {
      auth: auth.apiUser,
      description: 'Create organisation member',
      tags: ['api', 'organisation'],
      validate: {
        payload: {
          userOrg: {
            userId: Joi.string().required(),
            orgId: Joi.string().required(),
          },
        },
        params: {
          orgId: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'DELETE',
    path: `${options.basePath}/organisations/{orgId}/users/{userId}`,
    handler: handlers.actHandlerNeedsUser('delete', ['orgId', 'userId'], null, { ctrl: 'userOrg' }),
    config: {
      auth: auth.apiUser,
      description: 'Delete organisation member',
      tags: ['api', 'organisation'],
      validate: {
        params: {
          userId: Joi.string().required(),
          orgId: Joi.string().required(),
        },
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-orgs',
  dependencies: 'cd-auth',
};
