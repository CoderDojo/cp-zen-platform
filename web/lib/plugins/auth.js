const authCookie = require('hapi-auth-cookie');
const authBearer = require('hapi-auth-bearer-token');
const requestPromise = require('request-promise-native');

// This sets up the function called to verify the "Authorization: Bearer xxxx"
// token using the Hydra v1 admin interface.  It has to build a request.user
// object that matches what the "normal" login process produces, which means
// asking Seneca twice what the user is, once to resolve the Profile user ID
// into the Zen user ID, and then once to make a user object that is recognised
// by future calls.
//
// This is needed to allow CoderDojo frontend to make authenticated API
// requests, e.g. to join a dojo.
function validateBearerFunc(server) {
  return function(token, callback) {
    var request = this;
    var requestOptions = {
      url: process.env.RPI_AUTH_ADMIN_URL + 'oauth2/introspect',
      method: 'POST',
      headers: {
        "apikey": process.env.RPI_AUTH_ADMIN_KEY,
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
          // don't return an error so we get a 401 with "Bad Token"
          return callback(null, false);
        }
      })
      .then((rpiProfileId) => {
        getUserFromProfileId(rpiProfileId, request, (err, zenUserFromProfileId) => {
          if (err) {
           return callback(err, false, null);
          }

          if (zenUserFromProfileId.id) {
            // Make sure we return at this point so we don't slip into the
            // default "Id not found" return later.
            return getUserFromId(zenUserFromProfileId.id, request, (err, zenUser) => {
              if (err) {
               return callback(err, false, null);
              }

              // Set up the request user so future calls know who we are.  The
              // `ok: true` is needed to say that the user is logged in.
              request.user = {user: zenUser, ok: true};

              // Make everyone a basic-user here.  Admin functionality can be build if needed.
              return callback(null, true, {scope: 'basic-user'});
            });
          }

          return callback(new Error('Zen User Id not found for rpi Profile Id', rpiProfileId), false, null);
        });
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
      });
  }
}

// finds zen sys_user based on the rpi profile id
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

// turns the zen user id into an object with user data in format expected further in the chain
function getUserFromId(userId, request, callback) {
  request.seneca.act(
   {
     role: 'cd-users',
     cmd: 'load',
     id: userId
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
