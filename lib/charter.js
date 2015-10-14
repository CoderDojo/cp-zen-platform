'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-charter');

  server.route([{
    method: 'GET',
    path: options.basePath + '/charter',
    handler: handlers.actHandler('load')
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-charter'
};
