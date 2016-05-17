'use strict';

var cacheTimes = require('../../config/cache-times');

var controller = module.exports = [{
  method: 'GET',
  path: '/dashboard/{followin*}',
  config: { cache: { expiresIn: cacheTimes.medium } },
  handler: function (request, reply) {
    reply.view('index', request.locals);
  }

}];
