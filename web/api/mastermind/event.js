const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/events');
const eventHandlers = require('../../lib/handlers/event');

const basePath = '/api/3.0';
const { beforeDate, afterDate, status, isPublic, utcOffset, related } = validation.definitions;

module.exports = [
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
          related,
        }),
      },
    },
  },
];
