const _ = require('lodash');
const {
  getRedirectUri,
  getRegisterRedirectUri,
  getIdToken,
  decodeIdToken,
} = require('../../lib/rpi-auth');

// Look at Seneca auth docs/code to find password bypass
const rpiPassword = 'N6HgPWXpDAnVvCBkVaYHaGKHJAqg5VLY';

function handleRPILogin(request, reply) {
  const session = request.state['seneca-login'];
  if (session && session.token) {
    return reply.redirect('/');
  }
  const redirectUri = getRedirectUri();
  reply.redirect(redirectUri);
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
      name: decodedIdToken.name,
      firstName: decodedIdToken.name,
      lastName: '',
      email: decodedIdToken.email,
      password: rpiPassword,
      termsConditionsAccepted: true,
      initUserType: { name: 'parent-guardian' },
      profileId: decodedIdToken.uuid,
      nick: decodedIdToken.nickname,
    },
    profile: {
      country: {
        countryName: decodedIdToken.country,
      },
    },
  };
}

function handleCb(request, reply) {
  const login = (email, idToken) => {
    request.seneca.act(
      {
        role: 'user',
        cmd: 'login',
        email: email,
        password: rpiPassword,
      },
      (err, res) => {
        if (err) {
          // TODO: display error message to user
          // eslint-disable-next-line no-console
          console.error(err);
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
  // eslint-disable-next-line no-console
  console.log('cb', request.query);
  getIdToken(request.query.code)
    .then(idToken => {
      // eslint-disable-next-line no-console
      console.log({ idToken });
      const rpiProfile = decodeIdToken(idToken);
      // eslint-disable-next-line no-console
      console.log({ rpiProfile });

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

            // eslint-disable-next-line no-console
            console.log({ zenRegisterPayload });

            const msg = _.defaults(
              { role: 'cd-users', cmd: 'register' },
              zenRegisterPayload
            );
            return request.seneca.act(msg, (err, resp) => {
              if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                // TODO: display error message to user
                return reply.redirect('/');
              }
              if (!resp.user) {
                // TODO: display error message to user
                // eslint-disable-next-line no-console
                console.error(new Error('No user on registerResponse'));
                // eslint-disable-next-line no-console
                // TODO: redirect to redirect/refer page
                return reply.redirect('/');
              }
              return login(resp.user.email, idToken);
            });
          }
        }
      );
    })
    .catch(error => {
      // TODO: display error message to user
      // eslint-disable-next-line no-console
      console.error(error);
      return reply.redirect('/');
    });
}

module.exports = [
  {
    method: 'GET',
    path: '/rpi/login',
    handler: handleRPILogin,
  },
    path: '/rpi',
    handler: handleRPIAuth,
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
