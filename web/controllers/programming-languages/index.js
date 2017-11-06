const programmingLanguages = require('../../config/programmingLanguages.js');
const Boom = require('boom');

module.exports = [
  {
    method: 'GET',
    path: '/programming-languages',
    handler(request, reply) {
      if (programmingLanguages.length < 1) return reply(Boom.notFound({ error: 'List is empty' }));
      reply(programmingLanguages);
    },
  },
];
