const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/events');
const eventHandlers = require('../../lib/handlers/event');

const basePath = '/api/3.0';
const { dateBefore, dateAfter, status } = validation.definitions;

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/dojos/{dojoId}/events`,
    handler: eventHandlers.get(),
    config: {
      auth: auth.apiUser,
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
          'query[dateBefore]': dateBefore,
          'query[dateAfter]': dateAfter,
        }),
      },
    },
  },
];
