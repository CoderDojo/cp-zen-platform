'use strict';

var controller = module.exports = [{
  // TODO cache with versioned URL?
  method: 'GET',
  path: '/charter/template/{name*}',  
  handler: function (request, reply) {
    reply.view('charter/' + request.params.name, request.locals);
  }
}];
