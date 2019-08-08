const _ = require('lodash');
const Joi = require('joi');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');

exports.register = function(server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-dojos');

  server.route([
    {
      method: 'GET',
      path: `${options.basePath}/poll/{pollId}`,
      handler: handlers.actHandler('get_poll_setup', 'pollId'),
      config: {
        description: 'get poll configuration',
        notes: 'Returns the configuration of the poll',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            pollId: Joi.string(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/save`,
      handler: handlers.actHandlerNeedsUser('save_poll_setup'),
      config: {
        auth: auth.apiUser,
        description: 'save poll setup',
        notes: 'Save the definition of a poll',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            poll: {
              id: Joi.string()
                .guid()
                .optional(),
              question: Joi.string().required(),
              valueUnity: Joi.string().required(),
              maxAnswers: Joi.number().required(),
              endDate: Joi.date().optional(),
            },
          }),
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll`,
      handler: handlers.actHandlerNeedsCdfAdmin('get_poll_setup'),
      config: {
        auth: auth.apiUser,
        description: 'search polls setups',
        notes: 'Returns the polls setups',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            query: {
              id: Joi.string().optional(),
            },
          }),
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/results`,
      handler: handlers.actHandler('get_poll_results'),
      config: {
        description: 'get poll results',
        notes: 'Returns the results of the poll',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            query: {
              pollId: Joi.string(),
              dojoId: Joi.string().optional(),
              createdAt: Joi.alternatives().try(Joi.object(), Joi.date()),
            },
          }),
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/results/save`,
      handler: handlers.actHandler('save_poll_result'),
      config: {
        auth: auth.userIfPossible,
        description: 'Save poll answer',
        notes: 'Returns the saved poll',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            poll: {
              id: Joi.string()
                .guid()
                .optional(),
              pollId: Joi.string()
                .guid()
                .required(),
              dojoId: Joi.string().required(),
              value: Joi.number().required(),
            },
          }),
        },
      },
    },
    {
      method: 'DELETE',
      path: `${options.basePath}/poll/results/{resultId}`,
      handler: handlers.actHandlerNeedsUser('remove_poll_result', 'resultId'),
      config: {
        auth: auth.apiUser,
        description: 'Remove poll answer',
        notes: 'Returns an ok: object',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: Joi.object({ resultId: Joi.string().required() }),
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/poll/{pollId}/results/count`,
      handler: handlers.actHandler('poll_count', 'pollId'),
      config: {
        description: 'get Poll total value',
        notes: 'Returns a number',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            pollId: Joi.string()
              .guid()
              .required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/{pollId}/results/count/expected`,
      handler: handlers.actHandler('get_polled_list', 'pollId'),
      config: {
        auth: auth.userIfPossible,
        description: 'get Poll expected participation',
        notes: 'Returns a number',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            pollId: Joi.string()
              .guid()
              .required(),
          },
          payload: {
            dryRun: Joi.boolean().invalid(false),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/wh/sms`,
      handler: handlers.actHandler('save_sms_poll_result', '', 'xml'),
      config: {
        description: 'Save sms response',
        notes: 'Returns a twiML',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object().required(),
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/test`,
      handler: handlers.actHandlerNeedsUser('send_test_email_poll'),
      config: {
        auth: auth.apiUser,
        description: 'Send a test email',
        notes: 'Returns an OK object',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            pollId: Joi.string()
              .guid()
              .required(),
            email: Joi.string()
              .email()
              .required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/email`,
      handler: handlers.actHandlerNeedsUser('queue_email_poll'),
      config: {
        auth: auth.apiUser,
        description: 'Send a test email',
        notes: 'Returns an OK object',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            query: {
              id: Joi.string()
                .guid()
                .required(),
              limit$: Joi.number()
                .required()
                .max(1),
            },
            pollId: Joi.string()
              .guid()
              .required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/poll/start`,
      handler: handlers.actHandlerNeedsUser('start_poll'),
      config: {
        auth: auth.apiUser,
        description: 'Start the poll',
        notes: 'Returns an OK object',
        tags: ['api', 'dojos', 'polls'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            pollId: Joi.string()
              .guid()
              .required(),
            query: Joi.object().optional(),
          },
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'api-polls',
  dependencies: 'cd-auth',
};
