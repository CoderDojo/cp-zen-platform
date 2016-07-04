'use strict';

var _ = require('lodash');
var Joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-dojos');

  server.route([{
    method: 'POST',
    path: options.basePath + '/poll/save',
    handler: handlers.actHandler('save_poll_result'),
    config: {
      description: 'Save poll answer',
      notes: 'Returns an empty response',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ poll: {
          id: Joi.string().optional(),
          pollId: Joi.string(),
          dojoId: Joi.string(),
          value: Joi.number()
        }})
      }
    }
  },
  {
    method: 'GET',
    path: options.basePath + '/poll/count/{pollId}',
    handler: handlers.actHandler('poll_count', 'pollId'),
    config: {
      description: 'get Poll total value',
      notes: 'Returns a number',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          pollId: Joi.string()
        }
      }
    }
  },
  {
    method: 'GET',
    path: options.basePath + '/poll/{pollId}',
    handler: handlers.actHandler('get_poll_setup', 'pollId'),
    config: {
      description: 'get poll configuration',
      notes: 'Returns the configuration of the poll',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        params: {
          pollId: Joi.string()
        }
      }
    }
  },
  {
    method: 'POST',
    path: options.basePath + '/poll/results',
    handler: handlers.actHandler('get_poll_results'),
    config: {
      description: 'get poll results',
      notes: 'Returns the results of the poll',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({ query: {
          pollId: Joi.string(),
          dojoId: Joi.string().optional(),
          createdAt: Joi.alternatives().try(Joi.object(), Joi.date())
        }})
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-polls'
};
