'use strict';

var Joi = require('joi');
var _ = require('lodash');
exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-eventbrite');

  server.route([{
    method: 'POST',
    path: options.basePath + '/eventbrite/webhooks/{id}',
    handler: handlers.actHandler('handleWebhook', 'id'),
    config: {
      description: 'Handle webhook events from EventBrite',
      tags: ['api', 'events', 'eventbrite']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/dojos/{dojoId}/eventbrite/authorize',
    handler: handlers.actHandlerNeedsUser('authorize'),
    config: {
      description: 'Link a dojo to an eventbrite account',
      tags: ['api', 'dojos', 'eventbrite'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      },
      validate: {
        payload: Joi.object({
          code: Joi.string().required(),
          id: Joi.string().required()
        })
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/eventbrite/ptoken',
    handler: handlers.actHandler('token'),
    config: {
      description: 'Recover public token for Eventbrite generic App',
      tags: ['api', 'dojos', 'eventbrite'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'OK'}
          ]
        }
      }
    }
  }]);
  next();
};

exports.register.attributes = {
  name: 'api-eventbrite'
};
