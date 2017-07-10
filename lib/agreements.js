'use strict';

var _ = require('lodash');
var Joi = require('joi');
var authentications = require('./authentications');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-agreements');

  server.route([{
    method: 'POST',
    path: options.basePath + '/agreements',
    handler: handlers.actHandlerNeedsUser('save'),
    config: {
      auth: authentications.apiUser,
      description: 'Save the agreement',
      tags: ['api', 'users'],
      validate: {
        payload: {
          agreement: {
            fullName: Joi.string().required()
          }
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/count',
    handler: handlers.actHandler('count'),
    config: {
      description: 'Count the number of agreements',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/version/{version}/users/{userId}',
    handler: handlers.actHandler('loadUserAgreement', ['version', 'userId']),
    config: {
      description: 'Load user agreement',
      tags: ['api', 'users'],
      validate: {
        params: {
          userId: Joi.string().required(),
          version: Joi.string().required()
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/{id}',
    handler: handlers.actHandler('load', ['id']),
    config: {
      auth: authentications.apiUser,
      description: 'Load user agreement',
      tags: ['api', 'users'],
      validate: {
        params: {
          id: Joi.string().guid().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/',
    handler: handlers.actHandler('list', ['id']),
    config: {
      auth: authentications.apiUser,
      description: 'Search users agreements',
      tags: ['api', 'users'],
      validate: {
        params: {
          userId: Joi.alternatives(Joi.object(), Joi.string().guid()).optional(),
          agreementVersion: Joi.number()
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/version',
    handler: handlers.actHandler('getVersion'),
    config: {
      description: 'Get current agreement version',
      tags: ['api', 'users']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-agreements'
};
