const cacheTimes = require('../../config/cache-times');
const auth = require('../../lib/authentications');

module.exports = [{
  method: 'GET',
  path: '/dashboard/{followin*}',
  config: {
    cache: { expiresIn: cacheTimes.medium },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: '/login',
      },
    },
    auth: auth.basicUser,
  },
  handler(request, reply) {
    reply.view('index', request.app);
  },
}];
