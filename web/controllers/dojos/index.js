'use strict';

var controller = module.exports = [{
  method: 'GET',
  path: '/dojos/template/{name*}',
  handler: function (request, reply) {
    reply.view('dojos/' + request.params.name, request.app);
  }
}];
