var authCookie = require('hapi-auth-cookie');
var _ = require('lodash');
exports.register = function (server, options, next) {
  server.register(authCookie, function (err) {
    if (err) throw err;
    server.auth.strategy('seneca-login', 'cookie', {
        //TODO : change COOKIE_SECRET in prod to 32+ char
        password: process.env.COOKIE_SECRET || 'SecretsNeverLastLongAndThisOneNeedsToBe32Char',
        cookie: 'seneca-login',
        // // TODO - what's the ttl on the express cookie??
        ttl: 2 * 24 * 60 * 60 * 1000,     // two days
        path: '/',
        clearInvalid: true,
        appendNext: true, // Redirect is not set here, but relative to the routes
        isSecure: process.env.NODE_ENV === 'production',
        validateFunc: function (request, session, callback) {
          var token = session.token;
          var cdfPath = request.route.settings.auth && // hasAuth
           request.route.settings.auth.access.length > 0 && // has a rule defined
           request.route.settings.auth.access[0].scope.selection.length > 0 // uses scopes
          ? request.route.settings.auth.access[0].scope.selection.indexOf('cdf-admin') > -1 : false;
          getUser(request, token, function (err, loggedInUser) {
            if (loggedInUser && !err) {
              // Allows to use the seneca-cdf-login token to browse normal zen, but not the other way around
              request.user = loggedInUser;
              if (loggedInUser.user.roles.indexOf('cdf-admin') > -1 &&
               cdfPath && session.target === 'cdf') {
                return callback(null, true, {scope: 'cdf-admin'});
              } else {
                return callback(null, true, {scope: 'basic-user'}); // They're a `user`
              }
            } else {
              if (err) request.log(['error', '40x'], {status: '403', host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: err}, Date.now());
              return callback(null, false);
            }
          });
        }
    });
    next();
  });
};

// TODO - cache!
function getUser (request, token, cb) {
  if (token) {
    request.seneca.act({role: 'user', cmd: 'auth', token: token}, function (err, resp) {
      if (err) throw err;
      if (resp.ok === false) {
        return cb('login not ok');
      }
      return cb(null, resp);
    });
  } else {
    setImmediate(cb);
  }
}

exports.register.attributes = {
  name: 'cd-auth',
};
