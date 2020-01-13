const _ = require('lodash');
const Boom = require('boom');
const {
  getRedirectUri,
  getRegisterRedirectUri,
  getLogoutRedirectUri,
  getIdToken,
  decodeIdToken,
  rpiZenAccountPassword,
} = require('../../lib/rpi-auth');

function handleRPILogin(request, reply) {
  const session = request.state['seneca-login'];
  if (session && session.token) {
    return reply.redirect('/');
  }
  const redirectUri = getRedirectUri();
  reply.redirect(redirectUri);
}

function handleRPILogout(request, reply) {
  const session = request.state['seneca-login'];
  if (!session || (session && !session.token)) {
    return reply.redirect('/');
  }

  const msg = { role: 'user', cmd: 'logout', token: session.token };
  return request.seneca.act(msg, err => {
    if (err) return reply(Boom.badImplementation(err));
    request.cookieAuth.clear();
    delete request.user;
    const redirectUri = getLogoutRedirectUri();
    return reply.redirect(redirectUri);
  });
}

function handleRPIRegister(request, reply) {
  const session = request.state['seneca-login'];
  if (session && session.token) {
    return reply.redirect('/');
  }
  const redirectUri = getRegisterRedirectUri();
  reply.redirect(redirectUri);
}

function getZenRegisterPayload(decodedIdToken) {
  return {
    isTrusted: true,
    user: {
      id: decodedIdToken.uuid,
      name: decodedIdToken.nickname,
      firstName: decodedIdToken.name,
      lastName: '',
      email: decodedIdToken.email,
      password: rpiZenAccountPassword,
      termsConditionsAccepted: true,
      initUserType: { name: 'parent-guardian' },
      profileId: decodedIdToken.uuid,
      nick: decodedIdToken.email,
    },
    profile: {
      country: {
        countryName: decodedIdToken.country,
      },
    },
  };
}

function handleCb(request, reply) {
  if (request.query.error) {
    request.log(['error', 'rpi', 'callback'], request.query);
    return reply(Boom.badImplementation('callback error'));
  }

  const login = (email, idToken) => {
    request.seneca.act(
      {
        role: 'user',
        cmd: 'login',
        email: email,
        password: rpiZenAccountPassword,
      },
      (err, res) => {
        if (err) {
          // TODO: Graceful error display
          return reply(Boom.badImplementation(err));
        }
        request.cookieAuth.set({
          token: res.login.token,
          target: 'login',
          idToken,
        });
        return reply.redirect('/');
      }
    );
  };

  getIdToken(request.query.code)
    .then(idToken => {
      const rpiProfile = decodeIdToken(idToken);
      request.seneca.act(
        {
          role: 'cd-users',
          cmd: 'get_user_by_profile_id',
          profileId: rpiProfile.uuid,
        },
        (err, resp) => {
          if (resp.email) {
            // TODO: update email if not matching
            return login(resp.email, idToken);
          } else {
            const zenRegisterPayload = getZenRegisterPayload(rpiProfile);

            const msg = _.defaults(
              { role: 'cd-users', cmd: 'register' },
              zenRegisterPayload
            );
            return request.seneca.act(msg, (err, resp) => {
              if (err) {
                // TODO: Graceful error display
                return reply(Boom.badImplementation(err));
              }
              if (!resp.user) {
                // TODO: Graceful error display
                // Observed error reason: nick is already used
                return reply(
                  Boom.badImplementation('No user on registerResponse')
                );
              }
              return login(resp.user.email, idToken);
            });
          }
        }
      );
    })
    .catch(error => {
      // TODO: Graceful error display
      return reply(Boom.badImplementation(error));
    });
}

module.exports = [
  {
    method: 'GET',
    path: '/rpi/login',
    handler: handleRPILogin,
  },
  {
    method: 'GET',
    path: '/rpi/logout',
    handler: handleRPILogout,
  },
  {
    method: 'GET',
    path: '/rpi/register',
    handler: handleRPIRegister,
  },
  {
    method: 'GET',
    path: '/rpi/cb',
    handler: handleCb,
  },
];
