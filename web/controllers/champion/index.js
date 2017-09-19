module.exports = [
  {
    method: 'GET',
    path: '/champion/template/{name*}',
    handler({ params, locals }, reply) {
      reply.view(`champion/${params.name}`, locals);
    },
  },
];
