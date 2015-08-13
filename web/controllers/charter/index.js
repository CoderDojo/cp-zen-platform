'use strict';

var cacheTimes = require('../../config/cache-times');

var controller = module.exports = [{
  method: 'GET',
  path: '/charter/template/{name*}',
  config: { cache: { expiresIn: cacheTimes.long } },
  handler: function (request, reply) {
    reply.view('charter/' + request.params.name, request.locals);
  }
}];
