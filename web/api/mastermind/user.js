const Joi = require('joi');
const auth = require('../../lib/authentications');
const validation = require('../validations/users');
const userHandlers = require('../../lib/handlers/user');

const basePath = '/api/3.0';

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/users`,
    handler: userHandlers.search(),
    config: {
      auth: auth.cdfAdmin,
      description: 'Search for users',
      notes: 'Search for a user',
      tags: ['api', 'users', 'cdf'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        query: validation.base.keys({
          // Note: pass it to optional when we have more than one filtering available
          // But ensure that we have at least a filter : it shouldn't return the whole list of users
          email: validation.definitions.email.required(),
          related: Joi.string().valid('profile', 'children'),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: `${basePath}/users/{userId}`,
    handler: userHandlers.load(),
    config: {
      // NOTE: this is temporarly, this endpoint should be public.
      // This isn't done to avoid migrating all the logic of userprofileData right now
      auth: auth.cdfAdmin,
      description: 'Load an user',
      notes: 'Load an user',
      tags: ['api', 'users', 'cdf'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: validation.base.keys({
          userId: Joi.string()
            .guid()
            .required(),
        }),
        query: validation.base.keys({
          related: Joi.string().valid('profile', 'children'),
        }),
      },
    },
  },
  {
    method: 'DELETE',
    path: `${basePath}/users/{userId}`,
    handler: userHandlers.delete(),
    config: {
      auth: auth.cdfAdmin,
      description: 'Hard or soft-delete of a user',
      notes: 'Hard or soft-delete of a user',
      tags: ['api', 'users', 'cdf'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 204, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          userId: Joi.string()
            .guid()
            .required(),
        },
        payload: {
          soft: Joi.boolean(),
          cascade: Joi.boolean(),
        },
      },
    },
  },
];
