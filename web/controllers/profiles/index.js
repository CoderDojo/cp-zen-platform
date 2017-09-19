'use strict';

module.exports = [{
  method: 'GET',
  path: '/profiles/template/{name*}',
  handler: function (request, reply) {
    reply.view('profiles/' + request.params.name, request.app);
  }
}];
