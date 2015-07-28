'use strict';

if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var Hapi = require('hapi');
var path = require('path');
var requireindex = require('requireindex');
var controllers = requireindex('./web/controllers');
var so = require('./options.' + env  + '.js');
var seneca = module.exports = require('seneca')(so.main);
var locale = require('locale');
var languages = require('./config/languages.js');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
var server = new Hapi.Server(so.hapi)
var port = process.env.PORT || 8000

// Set up HAPI

// TODO
// var options = {
//     onconfig: function (config, next) {
//       var sessionConfig = require('./config/sessions.json')
//       // reset the redis host here for docker or localhost
//       sessionConfig.module['arguments'].push(so.redis)
//       next(null, config);
//     }
// }

server.connection({ port: port })

server.views({
  engines: { dust: require('hapi-dust') },
  path: path.join(__dirname, './public/templates'),
  partialsPath: path.join(__dirname, './public/templates')
})

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

server.state('NG_TRANSLATE_LANG_KEY', {
  ttl: null,
  isSecure: false,
  isHttpOnly: false,
  encoding: 'none',
  clearInvalid: false, // remove invalid cookies
  strictHeader: false // don't allow violations of RFC 6265
});

// Server CSS files.
server.register({
  register: require('hapi-less'),
  options: {
    home: path.join(__dirname, './public/css'),
    route: '/css/{filename*}',
    less: {
      compress: true
    }
  }
}, function (err) {
  if (err) {
    console.error('Failed loading hapi-less:');
    throw err;
  }
});


require('./lib/dust-i18n.js');


// Add all the server routes from the controllers.
_.each(controllers, function (controller) {
  server.route(controller);
})

// Serve public files
// These are separate to allow routes from seneca-web a change to have their middleware triggered.
server.route({
  method: 'GET',
  path: '/favicon.ico',
  handler: {
    file: {
      path: path.join(__dirname, 'public/favicon.ico')
    }
  }
});

server.route({
  method: 'GET',
  path: '/components/{filename*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public/components')
    }
  }
});

server.route({
  method: 'GET',
  path: '/img/{filename*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public/img')
    }
  }
});

server.route({
  method: 'GET',
  path: '/js/{filename*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public/js')
    }
  }
});

// Serve the auth .js files, etc.
server.route({
  method: 'GET',
  path: '/content/auth/{filename*}',
  handler: {
    directory: {
      path: path.join(__dirname, '../lib/auth/public')
    }
  }
});

// Use the seneca-web middleware with Hapi
server.register({
  register: require('hapi-seneca'),
  options: {
    seneca: seneca,
    cors: true
  }
}, function (err) {
  if (err) {
    console.error('hapi-seneca plugin did not load:');
    throw err;
  }

  server.start(function() {
    console.log('[%s] Listening on http://localhost:%d', env, port);
  });
});

server.ext('onPreResponse', function (request, reply) {
  var status = request.response.statusCode;

  if (status !== 404 && status !== 401) {
    return reply.continue();
  }

  return reply.view('errors/404', request.locals);
});


// Set up seneca

seneca.options(so);

seneca
  .use('ng-web')
  .use('../lib/users/user.js')
  .use('auth')
  .use('user-roles')
  .use('web-access')
  .use('../lib/auth/cd-auth.js')
  .use('../lib/charter/cd-charter.js')
  .use('../lib/dojos/cd-dojos.js')
  .use('../lib/countries/cd-countries.js')
  .use('../lib/geonames/cd-geonames.js')
  .use('../lib/users/cd-users.js')
  .use('../lib/agreements/cd-agreements.js')
  .use('../lib/badges/cd-badges.js')
  .use('../lib/profiles/cd-profiles.js')
  .use('../lib/events/cd-events.js')
  .use('../lib/oauth2/cd-oauth2.js')
  .use('../lib/config/cd-config.js', so.webclient)
  .use('../lib/sys/cd-sys.js')
;

_.each(so.client, function(opts) {
   seneca.client(opts);
});

//seneca.logroute( {level:'all' });

// capture seneca messages - leaving this here as we *may* do something with it
// if the debug level json is not good enough logging.
/*
seneca.sub({}, captureAllMessages);
function captureAllMessages(args) {
  console.log('*** captured = ', JSON.stringify(args));
}
*/
