const cacheTimes = require('../../config/cache-times');
const auth = require('../../../lib/authentications');

const handler = ({ locals }, reply) => {
  reply.view('cdf', locals);
};
const overrideAuth = {
  'hapi-auth-cookie': {
    redirectTo: '/cdf/login',
  },
};

module.exports = [
  {
    method: 'GET',
    path: '/cdf/dashboard/{anything*}',
    config: {
      auth: auth.cdfAdmin,
      plugins: overrideAuth,
    },
    handler,
  },
  {
    method: 'GET',
    path: '/cdf/login',
    config: {
      cache: {
        expiresIn: cacheTimes.short,
      },
    },
    handler({ locals }, reply) {
      reply.view('cdf', locals);
    },
  },
  {
    method: 'GET',
    path: '/cdf',
    config: { cache: { expiresIn: cacheTimes.short } },
    handler(request, reply) {
      reply.redirect('/cdf/login');
    },
  },
  {
    method: 'GET',
    path: '/cdf/',
    config: { cache: { expiresIn: cacheTimes.short } },
    handler(request, reply) {
      reply.redirect('/cdf/login');
    },
  },
];
