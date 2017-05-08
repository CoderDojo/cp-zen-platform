'use strict';

exports.start = function () {

if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var hapi = require('hapi');
var blankie = require('blankie');
var scooter = require('scooter');
var chairo = require('chairo');
var vision = require('vision');
var inert = require('inert');
var hapiSwagger = require('hapi-swagger');
var path = require('path');
var options = require('./config/options.js');
var locale = require('locale');
var languages = require('./config/languages.js');
var cacheTimes = require('./config/cache-times');
var cuid = require('cuid');
var crypto = require('crypto');
var util = require('util');
var fs = require('fs');
var os = require('os');
var debug = require('debug')('cp-zen-platform:index');

require('./lib/dust-i18n.js');
require('./lib/dust-loadjs.js');
require('./lib/dust-load-open-graph.js');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
var server = new hapi.Server(options.hapi)
var port = process.env.PORT || 8000
var host = process.env.HOSTNAME || '127.0.0.1';
var protocol = process.env.PROTOCOL || 'http';
var hostWithPort = protocol + '://' + host + ':' + port;
var uid = cuid();
var hasher = crypto.createHash('sha256');
hasher.update(os.hostname());
var hostUid = hasher.digest('hex') + '-' + uid;
server.method('getUid', function() { return hostUid });


function checkHapiPluginError (name) {
  return function (error) {
    if (error) {
      console.error('Failed loading a Hapi plugin: "' + name + '".');
      throw error;
    }
  };
}

// Set up HAPI
server.connection({
  port: port,
  // According to the HTTP spec and Chrome audit tool, Cache-Control headers should match what
  // would be sent for 200 when a 304 (Not Modified) is sent.
  routes: {
    cache: { statuses: [200,304] },
    cors: { origin: [ hostWithPort, 'https://changex.org', 'https://coderdojo.com', 'http://localhost'], credentials: true }
  }
});

if ('production' === env || 'staging' === env) {
  server.ext('onRequest', function(request, reply) {
    if (request.headers['x-forwarded-proto'] != 'https') {
      return reply.redirect('https://' + request.headers.host + request.path);
    }
    reply.continue();
  });
}

server.register(inert, function (err) {
  checkHapiPluginError('inert')(err);
});

server.register(require('blipp'), function (err) {
  checkHapiPluginError('blipp')(err);
});

server.register(vision, function (err) {
  checkHapiPluginError('vision')(err);
  server.views({
    engines: { dust: require('hapi-dust') },
    path: [path.join(__dirname, './public/templates'), path.join(__dirname, './public/js/')] ,
    partialsPath: path.join(__dirname, './public/templates')
  });
});

server.ext('onPreAuth', function (request, reply) {
  var translateCookie = request.state && request.state.NG_TRANSLATE_LANG_KEY;
  if (_.isArray(translateCookie)) {
    translateCookie = translateCookie[0];
  }
  var localesFormReq = (translateCookie && translateCookie.replace(/\"/g, ''))
    || request.headers['accept-language'];

  var requestLocales = new locale.Locales(localesFormReq);

  request.locals = {
    context: {
      locality: requestLocales.best(availableLocales).code
    }
  };

  return reply.continue();
});

//  TODO: merge onPreResponses cause they conflict
// Handler for 404/401
server.ext('onPreResponse', function (request, reply) {
  //  TODO: separate Boom errors from others
  //  Add instanceId for tracking
  if (_.has(request.response, 'header')) request.response.header('cp-host', hostUid);
  if (_.has(request.response, 'output')) request.response.output.headers['cp-host'] = hostUid;

  var status = _.has(request, 'response.output.statusCode') ? request.response.output.statusCode : 200;

  if (status === 400) {
    request.log(['error', '400'], {status: status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details')? request.response.data.details: request.response.output}, Date.now());
  }
  // if it's an api call, continue as normal..
  if (request.url.path.indexOf('/api/2.0') === 0) {
    return reply.continue();
  }

  // Hapi-auth redirect on failure for cdf portal
  // Others routes are handled by the default redirect of auth-cookie
  // Or should not be handled (403 permissions)
  if (status === 403) {
    if (_.has(request.route.settings, 'auth')) {
      var cdfPath = _.isEqual(request.route.settings.auth.scope, ['cdf-admin']);
      if (cdfPath) {
        return reply.redirect('/cdf/login?next=' + request.url.path);
      }
    }
  }

  if (status !== 404 && status !== 401) {
    return reply.continue();
  }

  request.log(['error', '40x'], {status: status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details')? request.response.data.details: request.response.output}, Date.now());
  debug('onPreResponse', 'showing 404 errors page');
  return reply.view('index', request.locals);
});

// Handler for 500
server.ext('onPreResponse', require('./lib/http-error-handler')(server));

server.register(require('hapi-auth-cookie'), function (err) {
    server.auth.strategy('seneca-login', 'cookie', {
        password: process.env.COOKIE_SECRET || 'SecretsNeverLastLong',
        cookie: 'seneca-login',
        // // TODO - what's the ttl on the express cookie??
        ttl: 2 * 24 * 60 * 60 * 1000,     // two days
        path: '/',
        appendNext: true, // Redirect is not set here, but relative to the routes
        isSecure: false,
        validateFunc: function (request, session, callback) {
          var token = session.token;
          var cdfPath = _.isEqual(request.route.settings.auth.scope, ['cdf-admin']);
          getUser(request, token, function (err, loggedInUser) {
            if (loggedInUser) {
              request.user = loggedInUser;
              // Allows to use the seneca-cdf-login token to browse normal zen, but not the other way around
              if (loggedInUser.user.roles.indexOf('cdf-admin') > -1 &&
               cdfPath && session.target === 'cdf'){
                return callback(null, true, {scope: 'cdf-admin'});
              } else {
                return callback(null, true, {scope: 'basic-user'}); // They're a `user`
              }
            } else {
              return callback(null, false);
            }
          });
        }
    });
})


// TODO - cache!
function getUser (request, token, cb) {
  if (token) {
    request.seneca.act({role: 'user', cmd:'auth', token: token}, function (err, resp) {
      if (err) return cb(err);
      if (resp.ok === false) {
        return cb('login not ok');
      }
      return cb(null, resp);
    });
  } else {
    setImmediate(cb);
  }
}

server.register({ register: require('hapi-etags'), options: { varieties: ['plain', 'buffer', 'stream'] } }, checkHapiPluginError('hapi-etags'));

server.register(scooter, function (err) {
  checkHapiPluginError('scooter')(err);

  server.register({ register: blankie, options: {
    childSrc: "'none'",
    connectSrc: "'self' https://*.intercom.io wss://*.intercom.io https://api-ping.intercom.io https://*.amazonaws.com",
    defaultSrc: "'none'",
    fontSrc: "'self' http://fonts.gstatic.com https://fonts.gstatic.com",
    frameSrc: "https://www.google.com https://www.youtube.com",
    frameAncestors: "'none'",
    imgSrc: "'self' 'unsafe-eval' 'unsafe-inline' data: * blob: *",
    manifestSrc: "'none'",
    mediaSrc: "'none'",
    objectSrc: "'none'",
    reflectedXss: 'block',
    scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com http://www.google-analytics.com https://www.google-analytics.com http://www.googletagmanager.com https://www.googletagmanager.com https://maps.gstatic.com https://www.gstatic.com https://widget.intercom.io https://js.intercomcdn.com https://www.google.com https://apis.google.com http://cdn.optimizely.com/js/3847550948.js http://www.googleadservices.com/pagead/conversion.js ",
    styleSrc: "'self' 'unsafe-inline' http://fonts.googleapis.com https://fonts.googleapis.com"
  }}, checkHapiPluginError('blankie'));
});

server.register({ register: require('./controllers') }, checkHapiPluginError('CoderDojo controllers'));


if (process.env.HAPI_DEBUG === 'true' || process.env.LOGENTRIES_ENABLED === 'true') {
  var goodOptions = {
    opsInterval: 1000,
    requestHeaders: true,
    requestPayload: true,
    responsePayload: true,
    reporters: []
  };
  if (process.env.HAPI_DEBUG) {
    var goodLogFile = fs.existsSync('/var/log/zen') ? '/var/log/zen/hapi-zen-platform.log' : '/tmp/hapi-zen-platform.log';
    goodOptions.reporters.push({
      reporter: require('good-file'),
      events: { log: '*', response: '*' },
      config: goodLogFile
    });
  }
  if (process.env.LOGENTRIES_ENABLED === 'true' && process.env.LOGENTRIES_TOKEN) {
    goodOptions.reporters.push({
      reporter: require('good-http'),
      events: { log: ['info'], error: '*', request: '*' },
      config: {
        endpoint: 'https://webhook.logentries.com/noformat/logs/' + process.env.LOGENTRIES_TOKEN,
        threshold: 0
      }
    });
  }

  server.register({ register: require('good'), options: goodOptions }, checkHapiPluginError('Good Logger'));
  server.log(['info'], {uid: hostUid}, Date.now());
}

var dojos = require('../lib/dojos.js');
server.register(dojos, function (err) {
  checkHapiPluginError('dojos')(err);
});

var cdUsers = require('../lib/users.js');
server.register(cdUsers, function (err) {
  checkHapiPluginError('users')(err);
});

var agreements = require('../lib/agreements.js');
server.register(agreements, function (err) {
  checkHapiPluginError('agreements')(err);
});

var sys = require('../lib/sys.js');
server.register(sys, function (err) {
  checkHapiPluginError('sys')(err);
});

var configRoute = require('../lib/config.js');
server.register({register: configRoute, options: options.webclient}, function (err) {
  checkHapiPluginError('config')(err);
});

var oauth2 = require('../lib/oauth2.js');
server.register(oauth2, function (err) {
  checkHapiPluginError('oauth2')(err);
});

var profiles = require('../lib/profiles.js');
server.register(profiles, function (err) {
  checkHapiPluginError('profiles')(err);
});

var badges = require('../lib/badges.js');
server.register(badges, function (err) {
  checkHapiPluginError('badges')(err);
});

var events = require('../lib/events.js');
server.register(events, function (err) {
  checkHapiPluginError('events')(err);
});

var polls = require('../lib/polls.js');
server.register(polls, function (err) {
  checkHapiPluginError('polls')(err);
});

var orgs = require('../lib/organisations.js');
server.register(orgs, function (err) {
  checkHapiPluginError('orgs')(err);
});


server.register({register: require('./lib/plugins/seneca-preloader-dustjs'),
  options: {handlers: ['seneca-event-preloader', 'seneca-dojo-preloader']}},
  checkHapiPluginError('Seneca preloader'));

// Locale related server method
function formatLocaleCode (code) {
  return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
}

var locality = function(request) {
  var localesFormReq = (request.state && request.state.NG_TRANSLATE_LANG_KEY && request.state.NG_TRANSLATE_LANG_KEY.replace(/\"/g, ''))
    || request.headers['accept-language'];

  var requestLocales = new locale.Locales(localesFormReq);

  return requestLocales.best(availableLocales).code;
}

server.method('locality', locality, {});

// This can be turned off in production if needs be
var noSwagger = process.env.NO_SWAGGER === 'true';
if (!noSwagger) {
  var version = '2.0';
  var swaggerOptions = {
    apiVersion: version,
    info: {
       'title': 'CoderDojo API',
       'version': version,
   },
    tags: [
      {
        'name': 'users'
      },
      {
         'name': 'dojos'
      },
      {
         'name': 'events'
      }]
  };
  server.register({
    register: hapiSwagger,
    options: swaggerOptions
  }, function (err) {
     checkHapiPluginError('hapi-swagger')(err);
  });
}

// Set up Chairo and seneca, then start the server.
server.register({ register: chairo, options: options }, function (err) {
  checkHapiPluginError('Chairo')(err);

  server.register({
    register: require('chairo-cache'),
    options: { cacheName: 'cd-cache' }
  }, function (err) {
     checkHapiPluginError('chairo-cache')(err);

     var seneca = server.seneca;

     _.each(options.client, function(opts) {
       seneca.client(opts);
     });


     server.start(function() {
       console.log('[%s] Listening on http://localhost:%d', env, port);
     });
   });
});
};
