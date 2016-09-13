'use strict';

var cacheTimes = require('../../config/cache-times');

module.exports = [{
  method: 'GET',
  path: '/cdf/{anything*}',
  config: { cache: { expiresIn: cacheTimes.short } },
  handler: function (request, reply) {
    console.log('cdfHandler');
    reply.view('cdf', request.locals);
  }
},
{
  method: 'GET',
  path: '/cdf',
  config: { cache: { expiresIn: cacheTimes.short } },
  handler: function (request, reply) {
    console.log('cdfHandler');
    reply.view('cdf', request.locals);
  }
}];
