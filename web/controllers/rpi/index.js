// eslint-disable-next-line import/no-extraneous-dependencies
const _ = require('lodash');
// eslint-disable-next-line import/no-extraneous-dependencies
const Boom = require('boom');
const { URLSearchParams } = require('url');
const {
  getRedirectUri,
  getRegisterRedirectUri,
  getEditRedirectUri,
  getLogoutRedirectUri,
  getIdToken,
  decodeIdToken,
  rpiZenAccountPassword,
} = require('../../lib/rpi-auth');

const oauthErrorMessage = 'Raspberry Pi Authentication Failed';

function getErrorRedirectUrl(message = oauthErrorMessage) {
  const errorUrlQueryParams = new URLSearchParams({ error: message });
  return `/?${errorUrlQueryParams}`;
}

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

function handleRPIEdit(request, reply) {
  const redirectUri = getEditRedirectUri();
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
    request.log(['error', '40x'], request.query);
    return reply.redirect(
      // TODO: use generic user friendly error
      getErrorRedirectUrl(`rpi callback error: ${request.query.error}`)
    );
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
          request.log(['error', '50x'], err);
          // TODO: use generic user friendly error
          return reply.redirect(
            getErrorRedirectUrl('Zen Login Failed - Seneca error.')
          );
        }
        if (!res.login || !res.login.token) {
          request.log(['error', '50x'], 'Zen Login Failed - No token.');
          // TODO: use generic user friendly error
          return reply.redirect(
            getErrorRedirectUrl('Zen Login Failed - No token.')
          );
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
          if (err) {
            request.log(['error', '50x'], err);
            // TODO: use generic user friendly error
            return reply.redirect(
              getErrorRedirectUrl('Get Profile User Failed - Seneca error.')
            );
          }
          if (resp.email) {
            return login(resp.email, idToken);
          } else {
            const zenRegisterPayload = getZenRegisterPayload(rpiProfile);

            const msg = _.defaults(
              { role: 'cd-users', cmd: 'register' },
              zenRegisterPayload
            );
            return request.seneca.act(msg, (err, resp) => {
              if (err) {
                request.log(['error', '50x'], err);
                // TODO: use generic user friendly error
                return reply.redirect(
                  getErrorRedirectUrl('Zen Registration Failed - Seneca error.')
                );
              }
              if (!resp.user) {
                request.log(
                  ['error', '50x'],
                  'Zen Registration Failed - No user.'
                );
                return reply.redirect(
                  // TODO: use generic user friendly error
                  getErrorRedirectUrl('Zen Registration Failed - No user.')
                );
              }
              return login(resp.user.email, idToken);
            });
          }
        }
      );
    })
    .catch(error => {
      request.log(['error', '40x'], error.data.payload);
      return reply.redirect(
        // TODO: use generic user friendly error
        getErrorRedirectUrl(
          `rpi id token error: ${error.data.payload.error_description}`
        )
      );
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
    path: '/rpi/edit',
    handler: handleRPIEdit,
  },
  {
    method: 'GET',
    path: '/rpi/cb',
    handler: handleCb,
  },
];
