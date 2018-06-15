const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/orders');
const orderHandlers = require('../../lib/handlers/order');

const basePath = '/api/3.0';
const { applications } = validation.definitions;

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/users/{userId}/orders`,
    handler: orderHandlers.get(),
    config: {
      auth: auth.apiUser,
      description: 'Load the specified user\'s orders',
      notes: 'User\'s Order',
      tags: ['api', 'orders'],
      plugins: {
        cpPermissions: {
          profiles: [{
            role: 'basic-user',
            customValidator: [{
              role: 'cd-users',
              cmd: 'is_self',
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
          userId: Joi.string().guid().required(),
        },
        query: validation.base.keys({
          'query[eventId]': Joi.string().guid(),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: `${basePath}/events/{eventId}/orders`,
    handler: orderHandlers.post(),
    config: {
      auth: auth.apiUser,
      description: 'Add An Order',
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
  {
    method: 'PUT',
    path: `${basePath}/users/{userId}/orders/{orderId}`,
    handler: orderHandlers.put(),
    config: {
      auth: auth.apiUser,
      description: 'Replace an order\'s application',
      notes: 'User\'s Order',
      tags: ['api', 'orders'],
      plugins: {
        cpPermissions: {
          profiles: [{
            role: 'basic-user',
            customValidator: [{
              role: 'cd-events',
              cmd: 'can_order_for',
            },
            {
              role: 'cd-events',
              cmd: 'is_own_order',
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
          userId: Joi.string().guid().required(),
          orderId: Joi.string().guid().required(),
        },
        payload: validation.base.keys({
          applications,
        }),
      },
    },
  },
];
