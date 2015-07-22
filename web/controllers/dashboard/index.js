'use strict';

var controller = module.exports = [{

  method: 'GET',
  path: '/dashboard/{followin*}',
  handler: function (request, reply) {
    reply.view('dashboard/index', request.locals);
  }

}];
