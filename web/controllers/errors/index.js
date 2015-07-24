'use strict';

module.exports = [{
  method: 'GET',
  path: '/errors/template/{name*}',
  handler: function (request, reply) {
    reply.view('errors/' + request.params.name, request.locals);
  }
}];
