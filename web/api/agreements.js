

const _ = require('lodash');
const Joi = require('joi');
const authentications = require('../lib/authentications');
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-agreements');

  server.route([{
    method: 'POST',
    path: `${options.basePath}/agreements`,
    handler: handlers.actHandlerNeedsUser('save'),
    config: {
      auth: authentications.apiUser,
      description: 'Save the agreement',
      tags: ['api', 'users'],
      validate: {
        payload: {
          agreement: {
            fullName: Joi.string().required(),
          },
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/agreements/count`,
    handler: handlers.actHandler('count'),
    config: {
      auth: authentications.apiUser,
      description: 'Count the number of agreements',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/agreements/version/{version}/users/{userId}`,
    handler: handlers.actHandler('loadUserAgreement', ['version', 'userId']),
    config: {
      auth: authentications.apiUser,
      description: 'Load user agreement',
      tags: ['api', 'users'],
      validate: {
        params: {
          userId: Joi.string().required(),
          version: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/agreements/{id}`,
    handler: handlers.actHandler('load', ['id']),
    config: {
      auth: authentications.apiUser,
      description: 'Load user agreement',
      tags: ['api', 'users'],
      validate: {
        params: {
          id: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/agreements/search`,
    handler: handlers.actHandler('list'),
    config: {
      auth: authentications.apiUser,
      description: 'Search users agreements',
      tags: ['api', 'users'],
      validate: {
        payload: {
          query: {
            userId: Joi.alternatives(
              Joi.object().keys({
                nin$: Joi.array().items(Joi.string().guid()),
                in$: Joi.array().items(Joi.string().guid()),
              }),
              Joi.string().guid(),
            ),
            agreementVersion: Joi.number(),
          },
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/agreements/version`,
    handler: handlers.actHandler('getVersion'),
    config: {
      description: 'Get current agreement version',
      tags: ['api', 'users'],
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-agreements',
  dependencies: 'cd-auth',
};
