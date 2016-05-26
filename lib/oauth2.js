'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-oauth2');

  server.route([{
    method: 'GET',
    path: options.basePath + '/oauth2/authorize',
    handler: handlers.actHandler('authorize'),
    config: {
      description: 'Request authorisation',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/oauth2/token',
    handler: handlers.actHandler('token'),
    config: {
      description: 'Request token',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/oauth2/profile',
    handler: handlers.actHandler('profile'),
    config: {
      description: 'Get user profile',
      tags: ['api', 'users']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-oauth2'
};
