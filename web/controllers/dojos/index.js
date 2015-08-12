'use strict';

var controller = module.exports = [{
  // TODO cache with versioned URL?
  method: 'GET',
  path: '/dojos/template/{name*}',
  handler: function (request, reply) {
    reply.view('dojos/' + request.params.name, request.locals);
  }
}];
