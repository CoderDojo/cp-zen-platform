'use strict';

var controller = module.exports = [{
  method: 'GET',
  path: '/champion/template/{name*}',
  handler: function (request, reply) {
    reply.view('champion/' + request.params.name, request.locals);
  }
}];
