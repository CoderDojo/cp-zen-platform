const Joi = require('joi');
const _ = require('lodash');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');

exports.register = function(server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-eventbrite');

  server.route([
    {
      method: 'POST',
      path: `${options.basePath}/eventbrite/webhooks/{id}`,
      handler: handlers.actHandler('handlers', 'id', null, { ctrl: 'webhook' }),
      config: {
        description: 'Handle webhook events from EventBrite',
        tags: ['api', 'events', 'eventbrite'],
        // Validation handled at the µs level
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/dojos/{dojoId}/eventbrite/authorisation`,
      handler: handlers.actHandlerNeedsUser('authorize', 'dojoId', null, {
        ctrl: 'auth',
      }),
      config: {
        description: 'Link a dojo to an eventbrite account',
        tags: ['api', 'dojos', 'eventbrite'],
        auth: auth.apiUser,
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            code: Joi.string().required()
          }),
          params: {
            dojoId: Joi.string()
              .uuid()
              .required(),
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: `${options.basePath}/dojos/{dojoId}/eventbrite/authorisation`,
      handler: handlers.actHandlerNeedsUser('deauthorize', 'dojoId', null, {
        ctrl: 'auth',
      }),
      config: {
        description: 'Unlink a dojo to an eventbrite account',
        tags: ['api', 'dojos', 'eventbrite'],
        auth: auth.apiUser,
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            dojoId: Joi.string().required(),
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/eventbrite/ptoken`,
      handler: handlers.actHandler('getApp', null, null, { ctrl: 'auth' }),
      config: {
        description: 'Recover public token for Eventbrite generic App',
        tags: ['api', 'dojos', 'eventbrite'],
        auth: auth.apiUser,
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/eventbrite/organisations/{code}`,
      handler: handlers.actHandlerNeedsUser('getOrganisations', null, null, {
        ctrl: 'auth',
      }),
      config: {
        description: "list all user's organisations",
        tags: ['api', 'dojos', 'eventbrite'],
        auth: auth.apiUser,
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            code: Joi.string().required()
          }
        },
      },
    },
  ]);
  next();
};

exports.register.attributes = {
  name: 'api-eventbrite',
  dependencies: 'cd-auth',
};
