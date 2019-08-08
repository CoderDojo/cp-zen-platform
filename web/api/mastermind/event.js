const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/events');
const eventHandlers = require('../../lib/handlers/event');

const basePath = '/api/3.0';
const {
  beforeDate,
  afterDate,
  status,
  isPublic,
  utcOffset,
  related,
} = validation.definitions;

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/dojos/{dojoId}/events{format?}`,
    handler: eventHandlers.get(),
    config: {
      auth: auth.userIfPossible,
      description: 'List events of a Dojo',
      notes: "Dojo's events",
      tags: ['api', 'events'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          dojoId: Joi.string()
            .guid()
            .required(),
          format: Joi.string()
            .valid('.ics')
            .allow('', null),
        },
        query: validation.base.keys({
          'query[status]': status,
          'query[public]': isPublic,
          'query[beforeDate]': beforeDate,
          'query[afterDate]': afterDate,
          'query[utcOffset]': utcOffset,
          related,
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${basePath}/events/{eventId}`,
    handler: eventHandlers.load(),
    config: {
      auth: auth.userIfPossible,
      description: 'Load an event',
      notes: 'An event',
      tags: ['api', 'events'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          eventId: Joi.string()
            .guid()
            .required(),
        },
        query: validation.base.keys({
          'query[beforeDate]': beforeDate,
          'query[afterDate]': afterDate,
          'query[utcOffset]': utcOffset,
          related,
        }),
      },
    },
  },
  {
    method: 'POST',
    path: `${basePath}/events`,
    handler: eventHandlers.create(),
    config: {
      auth: auth.apiUser,
      description: 'Create an event',
      notes: 'Creates an event',
      tags: ['api', 'events'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: validation.modelDefinitions,
      },
    },
  },
  {
    method: 'PUT',
    path: `${basePath}/events/{eventId}`,
    handler: eventHandlers.update(),
    config: {
      auth: auth.apiUser,
      description: 'Update an event',
      notes: 'Updates an event',
      tags: ['api', 'events'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: validation.updateModelDefinitions,
      },
    },
  },
];
