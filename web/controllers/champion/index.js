module.exports = [
  {
    method: 'GET',
    path: '/champion/template/{name*}',
    handler(request, reply) {
      reply.view(`champion/${request.params.name}`, request.app);
    },
  },
];
