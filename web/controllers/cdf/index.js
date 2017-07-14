'use strict';

var cacheTimes = require('../../config/cache-times');
var auth = require('../../../lib/authentications');

var handler = function (request, reply) {
    reply.view('cdf', request.locals);
};
var overrideAuth = {
  'hapi-auth-cookie': {
    redirectTo: '/cdf/login'
  }
};

module.exports = [{
  method: 'GET',
  path: '/cdf/dashboard/{anything*}',
  config: {
      auth: auth.cdfAdmin,
      plugins: overrideAuth
  },
  handler: handler
},
{
  method: 'GET',
  path: '/cdf/login',
  config: {
    cache: {
      expiresIn: cacheTimes.short
    }
  },
  handler: function (request, reply) {
      reply.view('cdf', request.locals);
  }
},
{
  method: 'GET',
  path: '/cdf',
  config: { cache: { expiresIn: cacheTimes.short } },
  handler: function (request, reply) {
    reply.redirect('/cdf/login');
  }
},
{
  method: 'GET',
  path: '/cdf/',
  config: { cache: { expiresIn: cacheTimes.short } },
  handler: function (request, reply) {
    reply.redirect('/cdf/login');
  }
}];
