'use strict';

var controller = module.exports = [{
  // TODO cache with versioned URL?
  method: 'GET',
  path: '/dashboard/{followin*}',
  handler: function (request, reply) {
    reply.view('dashboard/index', request.locals);
  }

}];
