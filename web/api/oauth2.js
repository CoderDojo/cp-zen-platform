

const _ = require('lodash');
const Joi = require('joi');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-oauth2');

  server.route([{
    method: 'GET',
    path: `${options.basePath}/oauth2/authorize`,
    handler: handlers.actHandlerNeedsUser('authorize', null, { soft: true }),
    config: {
      auth: auth.userIfPossible,
      description: 'Request authorisation',
      tags: ['api', 'users'],
      validate: {
        query: {
          response_type: Joi.string().valid('code').required(),
          redirect_uri: Joi.string().required(),
          scope: Joi.string().allow(null).allow(''),
          state: Joi.string().required(),
          client_id: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/oauth2/token`,
    handler: handlers.actHandler('token'),
    config: {
      description: 'Request token',
      tags: ['api', 'users'],
      validate: {
        payload: {
          code: Joi.string().required(),
          grant_type: Joi.string().required(),
          redirect_uri: Joi.string().required(),
          client_id: Joi.string().required(),
          client_secret: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/oauth2/profile`,
    handler: handlers.actHandler('profile'),
    config: {
      description: 'Get user profile',
      tags: ['api', 'users'],
      validate: {
        query: {
          access_token: Joi.string().required(),
        },
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-oauth2',
  dependencies: 'cd-auth',
};
