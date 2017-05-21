'use strict';

var _ = require('lodash');
var Joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({basePath: '/api/2.0'}, options);
  var handlers = require('./handlers.js')(server, 'cd-agreements');

  server.route([{
    method: 'POST',
    path: options.basePath + '/agreements',
    handler: handlers.actHandler('save'),
    config: {
      description: 'Saves the specified agreement',
      tags: ['api', 'users'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 400, message: 'Bad Request'},
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({
          agreement: {
            agreementVersion: Joi.number().optional(),
            ipAddress: Joi.string().optional(),
            fullName: Joi.string().optional(),
            userId: Joi.alternatives().try(Joi.string().guid(), Joi.string()).required()
          }
        })
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/list-by-ids',
    handler: handlers.actHandler('list'),
    config: {
      description: 'List Agreements by Id',
      tags: ['api', 'users'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 400, message: 'Bad Request'},
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({
          userIds: Joi.array(Joi.string())
        })
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/count',
    handler: handlers.actHandler('count'),
    config: {
      description: 'Count the number of agreements',
      tags: ['api', 'users'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 400, message: 'Bad Request'},
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
            agreementVersion: Joi.number().optional(),
            limit$: Joi.number().integer().min(0).optional()
        }})
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/{id}',
    handler: handlers.actHandler('load_user_agreement', 'id'),
    config: {
      description: 'Load a user agreement by their user_id',
      tags: ['api', 'users'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 400, message: 'Bad Request'},
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-agreements'
};
