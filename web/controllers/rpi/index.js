const { getRedirectUri, getToken } = require('../../lib/rpi-auth');

function handleRPIAuth(request, reply) {
  const redirectUri = getRedirectUri();
  reply.redirect(redirectUri);
}

function handleCb(request, reply) {
  // eslint-disable-next-line no-console
  console.log(request.query);
  // get code
  getToken(request.query.code)
    .then(token => {
      // eslint-disable-next-line no-console
      console.log({ token });
      // request full user from profile
      reply.redirect('/');
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      reply.redirect('/');
    });
}

module.exports = [
  {
    method: 'GET',
    path: '/rpi',
    handler: handleRPIAuth,
  },
  {
    method: 'GET',
    path: '/rpi/cb',
    handler: handleCb,
  },
];
