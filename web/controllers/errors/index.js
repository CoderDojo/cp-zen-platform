const cacheTimes = require('../../config/cache-times');

module.exports = [
  {
    method: 'GET',
    path: '/errors/template/{name*}',
    config: { cache: { expiresIn: cacheTimes.long } },
    handler({ params, locals }, reply) {
      reply.view(`errors/${params.name}`, locals);
    },
  },
];
