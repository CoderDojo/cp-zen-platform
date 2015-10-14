'use strict';
var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0/sys' }, options);

  server.route([{
    method: 'GET',
    path: options.basePath + '/ping',
    handler: pingHandler
  }]);

  function pingHandler (request, reply) {
    reply({status: 'ok'});
  }

  next();
};

exports.register.attributes = {
  name: 'api-sys'
};
