'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-agreements');

  server.route([{
    method: 'POST',
    path: options.basePath + '/agreements',
    handler: handlers.actHandler('save')
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/list-by-ids',
    handler: handlers.actHandler('get_agreements')
  }, {
    method: 'POST',
    path: options.basePath + '/agreements/count',
    handler: handlers.actHandler('count')
  }, {
    method: 'GET',
    path: options.basePath + '/agreements/{id}',
    handler: handlers.actHandler('load_user_agreement', 'id')
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-agreements'
};
