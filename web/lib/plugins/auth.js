const authCookie = require('hapi-auth-cookie');
const authHeader = require('hapi-auth-header');
const authBearer = require('hapi-auth-bearer-token');

const request = require('request-promise-native');


function validateFunc(server) {
  return (request, session, callback) => {
    const token = session.token;
    console.log("SESSION: ", session)
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
        console.log("LOGGED IN USER ", loggedInUser);
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
  console.log("IMMA GET USER token is ", token);
  if (token) {
    request.seneca.act({role: 'user', cmd: 'auth', token}, (err, resp) => {
      if (err) throw err;
      if (resp.ok === false) {
        return cb('login not ok');
      }
      if (resp.login && !resp.login.active) {
        return cb(new Error('Outdated token'));
      }
      console.log("GET USER RESPONSE IS: ", resp);
      return cb(null, resp);
    });
  } else {
    setImmediate(cb);
  }
}

exports.register = function (server, options, next) {
  // server.register([authCookie, authHeader], err => {
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
      validateFunc: function (token, callback) {
        console.log("TOKENS bearer: ", token);
        return callback(null, true, {scope: 'basic-user'}); // They're a `user`
        // console.log("HI TOKENS ARE: ", token);
        //
        // function introspect(token) {
        //   var requestOptions = {
        //     url: process.env.RPI_TOKEN_URL + 'oauth2/introspect',
        //     method: 'POST',
        //     headers: {
        //       "apikey": process.env.RPI_ADMIN_API_KEY,
        //       "Content-Type": "application/x-www-form-urlencoded"
        //     },
        //     formData: {
        //       "token": token
        //     },
        //     json: true
        //   };
        //   return request(requestOptions);
        // }
        //
        // console.log("TOKENS bearer: ", token);
        //
        //
        // introspect(token)
        //   .then(function (body) {
        //     if (body.active && body.sub) {
        //       console.log("aa RESULT SUB HERE IS: ", body.sub);
        //       var request = this;
        //       // request.user = {name: "kittens"}
        //       // request.auth.credentials = {name: "kittens"};
        //       // console.log("REQUEST WITH USER:", request)
        //       return callback(null, true, {scope: 'basic-user'}); // They're a `user`
        //     } else {
        //       console.log("USER NOT ACTIVE");
        //       return callback(null, false);
        //     }
        //   })
        //   .catch(function (err) {
        //     console.log("IN RESPONSE ERROR:", err);
        //     return callback(null, false);
        //   });
      }
      // server.auth.strategy('header', 'auth-header', {
      // validateFunc: function (tokens, callback) {
      //   console.log("HI TOKENS ARE: ", tokens);
      //
      //   function introspect(token) {
      //     var requestOptions = {
      //       url: process.env.RPI_TOKEN_URL + 'oauth2/introspect',
      //       method: 'POST',
      //       headers: {
      //         "apikey": process.env.RPI_ADMIN_API_KEY,
      //         "Content-Type": "application/x-www-form-urlencoded"
      //       },
      //       formData: {
      //         "token": token
      //       },
      //       json: true
      //     };
      //     return request(requestOptions);
      //   }
      //
      //   console.log("TOKENS bearer: ", tokens.Bearer);
      //
      //   var result = null;
      //
      //   introspect(tokens.Bearer)
      //     .then(function (body) {
      //       if (body.active && body.sub) {
      //         console.log("RESULT SUB HERE IS: ", body.sub);
      //         this.user = {name: "kittens"};
      //         return callback(null, true, {scope: 'basic-user'}); // They're a `user`
      //       } else {
      //         console.log("USER NOT ACTIVE");
      //         return callback(null, false);
      //       }
      //     })
      //     .catch(function (err) {
      //       console.log("IN RESPONSE ERROR:", err);
      //       return callback(null, false);
      //     });
      // }

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
