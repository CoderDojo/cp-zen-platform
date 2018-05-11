const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/orders');
const orderHandlers = require('../../lib/handlers/order');

const basePath = '/api/3.0';
const { applications } = validation.definitions;

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/events/{eventId}/orders/{orderId}`,
    handler: orderHandlers.get(),
    config: {
      auth: auth.apiUser,
      description: 'List A User\'s Order',
      notes: 'User\'s Order',
      tags: ['api', 'orders'],
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
        query: validation.base,
      },
    },
  },
  {
    method: 'POST',
    path: `${basePath}/events/{eventId}/orders`,
    handler: orderHandlers.post(),
    config: {
      auth: auth.apiUser,
      description: 'Add A User\'s Order',
      notes: 'User\'s Order',
      tags: ['api', 'orders'],
      plugins: {
        cpPermissions: {
          profiles: [{
            role: 'basic-user',
            customValidator: [{
              role: 'cd-events',
              cmd: 'can_order_for',
            }],
          }],
        },
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
        query: validation.base,
        payload: validation.base.keys({
          applications,
        }),
      },
    },
  },
];
