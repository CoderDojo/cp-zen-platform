'use strict';

var controller = module.exports = [
  {
    method: 'GET',
    path: '/embedded/event/{eventId}',
    config: {
      handler: function (request, reply) {
        reply.view('embedded', request.app);
      },
      plugins: {
        blankie: false,
        senecaPreloader: {
          handler: 'seneca-event-preloader'
        }
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
        reply.view('embedded', request.app);
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
