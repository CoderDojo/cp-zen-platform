'use strict';

var _ = require('lodash');
var joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);

  server.route([{
    method: 'GET',
    path: options.basePath + '/config/get',
    handler: getConfigHandler,
    config: {
      validate: {
        query: {
          key: joi.string()
        }
      }
    }
  }]);

  function getConfigHandler (request, reply) {
    var key = request.query.key;
    if (!options[key]) {
      reply('Config key not found: ' + key).code(404);
    } else {
      var ret = {};
      ret[key] = options[key];
      reply(ret);
    }
  }

  next();
};

exports.register.attributes = {
  name: 'api-config'
};
