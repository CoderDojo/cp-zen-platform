'use strict';

var cacheTimes = require('../../config/cache-times');

module.exports = [{
  method: 'GET',
  path: '/errors/template/{name*}',
  config: { cache: { expiresIn: cacheTimes.long } },
  handler: function (request, reply) {
    reply.view('errors/' + request.params.name, request.locals);
  }
}];
