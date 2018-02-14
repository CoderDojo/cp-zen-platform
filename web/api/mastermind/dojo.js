const _ = require('lodash');
const Joi = require('joi');
const auth = require('../../lib/authentications');
const dojoHandlers = require('../../lib/handlers/dojo');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);

  server.route([{
    method: 'PATCH',
    path: `${options.basePath}/dojos/{id}/verified`,
    handler: dojoHandlers.verify(),
    config: {
      auth: auth.apiUser,
      description: 'Update the verification of a dojo',
      notes: 'Update',
      tags: ['api', 'dojos', 'verification'],
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
          id: Joi.string().guid().required(),
        },
        payload: Joi.object({
          verified: Joi.number().valid(0).valid(1),
        }),
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'mastermind-api-dojo',
  dependencies: 'cd-auth',
};
