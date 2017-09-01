module.exports = [
  {
    method: 'GET',
    path: '/profiles/template/{name*}',
    handler({ params, locals }, reply) {
      reply.view(`profiles/${params.name}`, locals);
    },
  },
];
