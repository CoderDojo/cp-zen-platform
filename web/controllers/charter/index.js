'use strict';

var controller = module.exports = [{
  method: 'GET',
  path: '/charter/template/{name}',  
  handler: function (request, reply) {
    reply.view('charter/' + request.params.name);
  }
}];
