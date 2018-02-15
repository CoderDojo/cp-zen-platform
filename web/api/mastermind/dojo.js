const Joi = require('joi');
const auth = require('../../lib/authentications');
const dojoHandlers = require('../../lib/handlers/dojo');

const basePath = '/api/2.0';

module.exports = [{
  method: 'PATCH',
  path: `${basePath}/dojos/{id}/verified`,
  handler: dojoHandlers.verify(),
  config: {
    auth: auth.apiUser,
    description: 'Update the verification of a dojo',
    notes: 'Update',
    tags: ['api', 'dojos', 'verification'],
    plugins: {
      cpPermissions: {
        profiles: [
          { role: 'cdf-admin' },
        ],
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
        id: Joi.string().guid().required(),
      },
      payload: Joi.object({
        verified: Joi.number().valid(0).valid(1),
      }),
    },
  },
}];
