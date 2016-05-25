'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-agreements');

  server.route([{
    method: 'POST',
    path: options.basePath + '/agreements',
    handler: handlers.actHandler('save'),
    config: {
      description: 'Save the agreement',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/list-by-ids',
    handler: handlers.actHandler('get_agreements'),
    config: {
      description: 'List Agreement by Id',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/count',
    handler: handlers.actHandler('count'),
    config: {
      description: 'Count the number of agreements',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/{id}',
    handler: handlers.actHandler('load_user_agreement', 'id'),
    config: {
      description: 'Load user agreement',
      tags: ['api', 'users']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-agreements'
};
