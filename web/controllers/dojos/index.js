module.exports = [
  {
    method: 'GET',
    path: '/dojos/template/{name*}',
    handler({ params, locals }, reply) {
      reply.view(`dojos/${params.name}`, locals);
    },
  },
];
