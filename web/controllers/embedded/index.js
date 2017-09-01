module.exports = [
  {
    method: 'GET',
    path: '/embedded/event/{eventId}',
    config: {
      handler({ locals }, reply) {
        reply.view('embedded', locals);
      },
      plugins: {
        blankie: false,
        senecaPreloader: {
          handler: 'seneca-event-preloader',
        },
      },
      security: {
        xframe: false,
      },
    },
  },

  {
    method: 'GET',
    path: '/embedded/dojos-map/lat/{lat}/lon/{lon}',
    config: {
      handler({ locals }, reply) {
        reply.view('embedded', locals);
      },
      plugins: {
        blankie: false,
      },
      security: {
        xframe: false,
      },
    },
  },
];
