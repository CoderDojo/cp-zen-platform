const Joi = require('joi');
const auth = require('../../lib/authentications');
const leadHandlers = require('../../lib/handlers/lead');

const basePath = '/api/3.0';

module.exports = [
  {
    method: 'GET',
    path: `${basePath}/leads`,
    handler: leadHandlers.list(),
    config: {
      auth: auth.apiUser,
      description: 'Retrieve leads with a simple filtering',
      notes: 'List',
      tags: ['api', 'dojos', 'lead'],
      plugins: {
        cpPermissions: {
          profiles: [
            { role: 'basic-user',
              customValidator: [{
                role: 'cd-users',
                cmd: 'is_self',
              }]
            },
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
        query: {
          userId: Joi.string().guid().required(),
          deleted: Joi.number().integer().valid(0, 1),
        },
      },
    },
  },
];
