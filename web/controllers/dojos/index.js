'use strict';

var controller = module.exports = [{
  method: 'GET',
  path: '/dojos/template/{name}',
  handler: function (request, reply) {
    // TODO seems like data should be passed in with the template
    reply.view('dojos/' + request.params.name);
  }
}];
