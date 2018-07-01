const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/events');
const eventHandlers = require('../../lib/handlers/event');
const applicationHandlers = require('../../lib/handlers/application');

const basePath = '/api/3.0';
const { beforeDate, afterDate, status, isPublic, utcOffset } = validation.definitions;

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/dojos/{dojoId}/events/{eventId}/applications`,
    handler: applicationHandlers.list(),
    config: {
      auth: auth.userIfPossible,
      description: 'List applications of a Dojo',
      notes: 'Events\'s applications',
      tags: ['api', 'events', 'applications'],
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
          dojoId: Joi.string().guid().required(),
          eventId: Joi.string().guid().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${basePath}/dojos/{dojoId}/events`,
    handler: eventHandlers.get(),
    config: {
      auth: auth.userIfPossible,
      description: 'List events of a Dojo',
      notes: 'Dojo\'s events',
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
          dojoId: Joi.string().guid().required(),
        },
        query: validation.base.keys({
          'query[status]': status,
          'query[public]': isPublic,
          'query[beforeDate]': beforeDate,
          'query[afterDate]': afterDate,
          'query[utcOffset]': utcOffset,
          related: Joi.string().valid(['sessions', 'sessions.tickets']),
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
          eventId: Joi.string().guid().required(),
        },
        query: validation.base.keys({
          'query[beforeDate]': beforeDate,
          'query[afterDate]': afterDate,
          'query[utcOffset]': utcOffset,
          related: Joi.string().valid(['sessions', 'sessions.tickets']),
        }),
      },
    },
  },
  // TODO : remove one of those load event
  {
    method: 'GET',
    path: `${basePath}/dojos/{dojoId}/events/{eventId}`,
    handler: eventHandlers.load(),
    config: {
      auth: auth.userIfPossible,
      description: 'Load an event of a Dojo',
      notes: 'Dojo\'s events',
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
          dojoId: Joi.string().guid().required(),
          eventId: Joi.string().guid().required(),
        },
        query: Joi.object().keys({
          related: Joi.string().valid(['sessions', 'sessions.tickets', 'sessions.tickets.applications']),
        }),
      },
    },
  },
];
