'use strict';

var cacheTimes = require('../../config/cache-times');
var auth = require('../../lib/authentications');

module.exports = [{
  method: 'GET',
  path: '/dashboard/{followin*}',
  config: {
    cache: { expiresIn: cacheTimes.medium },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: '/login'
      }
    },
    auth: auth.basicUser
  },
  handler: function (request, reply) {
    reply.view('index', request.app);
  }
}];
