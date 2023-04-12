const authCookie = require('hapi-auth-cookie');
const authHeader = require('hapi-auth-header');
const authBearer = require('hapi-auth-bearer-token');
const requestPromise = require('request-promise-native')

function validateBearerFunc(server) {
  return function(token, callback) {
    var request = this;
    var requestOptions = {
      url: process.env.RPI_AUTH_ADMIN_URL + 'oauth2/introspect',
      method: 'POST',
      headers: {
        "apikey": process.env.RPI_ADMIN_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      formData: {
        "token": token
      },
      json: true
    };

    requestPromise(requestOptions)
      .then((body) => {
        if (body.active && body.sub) {
          return body.sub;
        } else {
          throw new Error('Bad bearer token');
        }
      })
      .then((rpiProfileId) => {
        getUserFromProfileId(rpiProfileId, this, (err, zenUser) => {
          if (err) {
           throw err
          }
          if (zenUser.email) {
            request.user = zenUser;
            return callback(null, true, {scope: 'basic-user'});
          } else {
            throw new Error('User email not found for rpiProfileId', rpiProfileId)
          }
        }).catch((err) => {
          throw err
        })
      })
      .catch((err) => {
        request.log(
          ['error', '40x'],
          {
            status: '403',
            host: server.app.hostUid,
            payload: request.payload,
            params: request.params,
            url: request.url,
            user: request.user,
            error: err,
          },
          Date.now()
        );
        return callback(null, false);
      })
  }
}

function getUserFromProfileId(rpiProfileId, request, callback) {
  request.seneca.act(
   {
     role: 'cd-users',
     cmd: 'get_user_by_raspberry_id',
     raspberryId: rpiProfileId
     },
   callback
 );
}

// Cookie validation
function validateFunc(server) {
  return (request, session, callback) => {
    const token = session.token;
    const cdfPath =
      request.route.settings.auth && // hasAuth
      request.route.settings.auth.access.length > 0 && // has a rule defined
      request.route.settings.auth.access[0].scope.selection.length > 0 // uses scopes
        ? request.route.settings.auth.access[0].scope.selection.indexOf(
            'cdf-admin'
          ) > -1
        : false;
    getUser(request, token, (uErr, loggedInUser) => {
      if (loggedInUser && !uErr) {
        // Allows to use the seneca-cdf-login token to browse normal zen,
        // but not the other way around
        request.user = loggedInUser;
        if (loggedInUser.user.roles.indexOf('cdf-admin') > -1 && cdfPath) {
          return callback(null, true, {scope: 'cdf-admin'});
        }
        return callback(null, true, {scope: 'basic-user'}); // They're a `user`
      }
      if (uErr)
        request.log(
          ['error', '40x'],
          {
            status: '403',
            host: server.app.hostUid,
            payload: request.payload,
            params: request.params,
            url: request.url,
            user: request.user,
            error: uErr,
          },
          Date.now()
        );
      return callback(null, false);
    });
  };
}

// TODO - cache!
function getUser(request, token, cb) {
  if (token) {
    request.seneca.act({role: 'user', cmd: 'auth', token}, (err, resp) => {
      if (err) throw err;
      if (resp.ok === false) {
        return cb('login not ok');
      }
      if (resp.login && !resp.login.active) {
        return cb(new Error('Outdated token'));
      }
      return cb(null, resp);
    });
  } else {
    setImmediate(cb);
  }
}

exports.register = function (server, options, next) {
  server.register([authCookie, authBearer], err => {
    if (err) throw err;
    server.auth.strategy('seneca-login', 'cookie', {
      // TODO : change COOKIE_SECRET in prod to 32+ char
      password:
        process.env.COOKIE_SECRET ||
        'SecretsNeverLastLongAndThisOneNeedsToBe32Char',
      cookie: 'seneca-login',
      ttl: 2 * 24 * 60 * 60 * 1000, // two days
      path: '/',
      clearInvalid: true,
      appendNext: 'referer', // Redirect is not set here, but relative to the routes
      isSecure: process.env.NODE_ENV === 'production',
      isSameSite: 'Lax',
      validateFunc: validateFunc(server),
    });
    server.auth.strategy('header', 'bearer-access-token', {
      validateFunc: validateBearerFunc(server)
    });
    next();
  });
};

exports.register.attributes = {
  name: 'cd-auth',
  fns: {
    getUser,
    validateFunc,
  },
};
