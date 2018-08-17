

const _ = require('lodash');
const Joi = require('joi');
const auth = require('../lib/authentications');
const joiValidator = require('./validations/dojos')();
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-dojos');

  server.route([{
    method: 'POST',
    path: `${options.basePath}/dojos/lead`,
    handler: handlers.actHandlerNeedsUser('save', null, null, { ctrl: 'lead' }),
    config: {
      auth: auth.apiUser,
      description: 'lead',
      notes: 'lead',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ lead: {
          id: joiValidator.guid().optional(),
          application: joiValidator.application(),
          userId: joiValidator.guid().optional(),
          completed: Joi.boolean().valid(false),
        } }),
      },
    },
  }, {
    method: 'PUT',
    path: `${options.basePath}/dojos/lead/{leadId}`,
    handler: handlers.actHandlerNeedsUser('submit', null, null, { ctrl: 'lead' }),
    config: {
      auth: auth.apiUser,
      description: 'lead',
      notes: 'lead',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ lead: {
          id: joiValidator.guid().optional(),
          application: joiValidator.application(true).required(),
          userId: joiValidator.guid().required(),
          completed: Joi.boolean().valid(true),
        } }),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/lead/{id}`,
    handler: handlers.actHandlerNeedsUser('load_dojo_lead', 'id'),
    config: {
      auth: auth.apiUser,
      description: 'dojo lead',
      notes: 'dojo lead',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'DELETE',
    path: `${options.basePath}/dojos/lead/{id}`,
    handler: handlers.actHandlerNeedsUser('delete', 'id', null, { ctrl: 'lead' }),
    config: {
      auth: auth.apiUser,
      description: 'dojo lead',
      notes: 'dojo lead',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojoleads`,
    handler: handlers.actHandlerNeedsUser('search', null, null, { ctrl: 'dojolead' }),
    config: {
      auth: auth.apiUser,
      description: 'Search dojo leads',
      notes: 'Search dojo leads',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          id: Joi.alternatives(
            Joi.string().guid(),
            Joi.object().keys({
              'nin$': Joi.array().items(Joi.string().guid()),
              'in$': Joi.array().items(Joi.string().guid()),
            })
          ),
          userId: joiValidator.guid(), // used for validation is-self
          email: Joi.string(), // to allow regex
          dojoEmail: Joi.string(), // to allow regex
          dojoName: Joi.string(),
          stage: Joi.alternatives(Joi.number().integer(), Joi.object()),
          completed: Joi.boolean(),
          verified: Joi.number().integer(),
          deleted: Joi.number().integer(),
          alpha2: joiValidator.alpha2().optional().description('two capital letters representing the country'),
          skip$: Joi.alternatives(Joi.number(), Joi.object()),
          limit$: Joi.alternatives(Joi.number(), Joi.object()),
          sort$: Joi.alternatives(Joi.number(), Joi.object()),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/leads`,
    handler: handlers.actHandlerNeedsUser('search', null, null, { ctrl: 'lead' }),
    config: {
      auth: auth.apiUser,
      description: 'Search dojo leads',
      notes: 'Search dojo leads',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          id: Joi.alternatives(
            Joi.string().guid(),
            Joi.object().keys({
              'nin$': Joi.array().items(Joi.string().guid()),
              'in$': Joi.array().items(Joi.string().guid()),
            })
          ),
          userId: joiValidator.guid(), // used for validation is-self
          email: Joi.string(),
          completed: Joi.boolean(),
          deleted: Joi.number().integer().optional(),
          skip$: Joi.alternatives(Joi.number(), Joi.object()),
          limit$: Joi.alternatives(Joi.number(), Joi.object()),
          sort$: Joi.alternatives(Joi.number(), Joi.object()),
        } }),
      },
    },
  }]);

  next();
};
exports.register.attributes = {
  name: 'api-leads',
  dependencies: 'cd-auth',
};
