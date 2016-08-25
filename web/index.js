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
var util = require('util');
var fs = require('fs');
var debug = require('debug')('cp-zen-platform:index');

require('./lib/dust-i18n.js');
require('./lib/dust-loadjs.js');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
var server = new hapi.Server(options.hapi)
var port = process.env.PORT || 8000
var host = process.env.HOSTNAME || '127.0.0.1';
var protocol = process.env.PROTOCOL || 'http';
var hostWithPort = protocol + '://' + host + ':' + port;

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
  var localesFormReq = (request.state && request.state.NG_TRANSLATE_LANG_KEY && request.state.NG_TRANSLATE_LANG_KEY.replace(/\"/g, ''))
    || request.headers['accept-language'];

  var requestLocales = new locale.Locales(localesFormReq);

  request.locals = {
    context: {
      locality: requestLocales.best(availableLocales).code
    }
  };

  return reply.continue();
});

// Handler for 404/401
server.ext('onPreResponse', function (request, reply) {
  var status = _.has(request, 'response.output.statusCode') ? request.response.output.statusCode : 200;

  // if it's an api call, continue as normal..
  if (request.url.path.indexOf('/api/2.0') === 0) {
    return reply.continue();
  }
  if (status !== 404 && status !== 401) {
    return reply.continue();
  }
  debug('onPreResponse', 'showing 404 errors page');
  return reply.view('index', request.locals);
});

// Handler for 500
server.ext('onPreResponse', function (request, reply) {
  var headerStatus = _.get(request, 'response.statusCode', 500);
  var bodyStatus = _.get(request, 'response.output.payload.statusCode', undefined);

  if (headerStatus !== 500 && bodyStatus !== 500) {
    return reply.continue();
  }

  // Display full error message if not in production environment.
  if (env !== 'production') {
    return reply.continue();
  }

  // Otherwise, give a generic error reply to hide errors in production.
  debug('onPreResponse', 'showing 500 errors page');
  return reply.view('errors/500', request.locals);
});

// TODO - cache!
function getUser (request, cb) {
  var token = request.state['seneca-login'];
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
};

server.ext('onPostAuth', function (request, reply) {
  debug('onPostAuth', request.url.path, 'login:', request.state['seneca-login']);
  var url = request.url.path;
  var profileUrl = '/dashboard/profile';
  var restrictedRoutesWhenLoggedIn = ['/', '/register', '/login'];

  getUser(request, function (err, user) {
    if (err) {
      console.error(err);
      return reply.continue();
    }
    debug('onPostAuth', 'user:', user);
    request.user = user;

    if (_.contains(url, '/dashboard') && !_.contains(url, '/login') && !request.user) {
      // Not logged in, redirect to dojo-detail if trying to see dojo detail
      if (/\/dashboard\/dojo\/[a-zA-Z]{2}\//.test(url)){
        debug('onPostAuth', 'redirecting to dojo detail');
        return reply.redirect(url.replace('dashboard/',''))
      } else {
        // Otherwise, redirect to /login with referer parameter
        debug('onPostAuth', 'redirecting to /login with referer', url);
        var referer = encodeURIComponent(url);
        return reply.redirect('/login?referer=' + url);
      }
    }

    if (_.contains(restrictedRoutesWhenLoggedIn, url) && request.user) {
      debug('onPostAuth', 'url has restricted routes:', url, 'redirecting to /dojo-list');
      return reply.redirect('/dashboard/dojo-list');
    }

    debug('onPostAuth', 'continuing');
    return reply.continue();
  });
});

server.register({ register: require('hapi-etags'), options: { varieties: ['plain', 'buffer', 'stream'] } }, checkHapiPluginError('hapi-etags'));

server.register(scooter, function (err) {
  checkHapiPluginError('scooter')(err);

  server.register({ register: blankie, options: {
    childSrc: "'none'",
    connectSrc: "'self' https://*.intercom.io wss://*.intercom.io https://api-ping.intercom.io https://*.amazonaws.com",
    defaultSrc: "'none'",
    fontSrc: "'self' http://fonts.gstatic.com https://fonts.gstatic.com",
    frameSrc: "https://www.google.com",
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

if (process.env.HAPI_DEBUG === 'true') {
  var goodLogFile = fs.existsSync('/var/log/zen') ? '/var/log/zen/hapi-zen-platform.log' : '/tmp/hapi-zen-platform.log';
  var goodOptions = {
    opsInterval: 1000,
    requestPayload:true,
    responsePayload:true,
    reporters: [{
      reporter: require('good-file'),
      events: { log: '*', response: '*' },
      config: goodLogFile
    }]
  };

  server.register({ register: require('good'), options: goodOptions }, checkHapiPluginError('Good Logger'));
}

var dojos = require('../lib/dojos.js');
server.register(dojos, function (err) {
  checkHapiPluginError('dojos')(err);
});

var cdUsers = require('../lib/users.js');
server.register(cdUsers, function (err) {
  checkHapiPluginError('users')(err);
});

var charter = require('../lib/charter.js');
server.register(charter, function (err) {
  checkHapiPluginError('charter')(err);
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

// TODO - what's the ttl on the express cookie??
server.state('seneca-login', {
  ttl: 2 * 24 * 60 * 60 * 1000,     // two days
  path: '/'
});

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
