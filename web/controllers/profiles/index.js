'use strict';

var controller = module.exports = [{
  // TODO cache with versioned URL?
  method: 'GET',
  path: '/profiles/template/{name*}',
  handler: function (request, reply) {
    reply.view('profiles/' + request.params.name, request.locals);
  }
}];
