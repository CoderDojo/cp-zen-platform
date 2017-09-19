

const _ = require('lodash');
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
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/oauth2/token`,
    handler: handlers.actHandler('token'),
    config: {
      description: 'Request token',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/oauth2/profile`,
    handler: handlers.actHandler('profile'),
    config: {
      description: 'Get user profile',
      tags: ['api', 'users'],
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-oauth2',
  dependencies: 'cd-auth',
};
