'use strict';

var controller = module.exports = [
  {
    method: 'GET',
    path: '/embedded/event/{eventId}',
    config: {
      handler: function (request, reply) {
        reply.view('embedded', request.locals);
      },
      plugins: {
        blankie: false
      },
      security: {
        xframe: false
      }
    }
  },

  {
    method: 'GET',
    path: '/embedded/dojos-map/lat/{lat}/lon/{lon}',
    config: {
      handler: function (request, reply) {
        reply.view('embedded', request.locals);
      },
      plugins: {
        blankie: false
      },
      security: {
        xframe: false
      }
    }
  },
];
