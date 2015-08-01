'use strict';

if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var Hapi = require('hapi');
var Chairo = require('chairo');
var path = require('path');
var options = require('./options.' + env + '.js');
var locale = require('locale');
var languages = require('./config/languages.js');

require('./lib/dust-i18n.js');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
var server = new Hapi.Server(options.hapi)
var port = process.env.PORT || 8000

function checkHapiPluginError (name) {
  return function (error) {
    if (error) {
      console.error('Failed loading a Hapi plugin: "' + name + '".');
      throw error;
    }
  };
}

// Set up HAPI

server.connection({ port: port })

server.state('NG_TRANSLATE_LANG_KEY', {
  ttl: null,
  isSecure: false,
  isHttpOnly: false,
  encoding: 'none',
  clearInvalid: false, // remove invalid cookies
  strictHeader: false // don't allow violations of RFC 6265
});

server.views({
  engines: { dust: require('hapi-dust') },
  path: path.join(__dirname, './public/templates'),
  partialsPath: path.join(__dirname, './public/templates')
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

server.ext('onPreResponse', function (request, reply) {
  var status = request.response.statusCode;

  if (status !== 404 && status !== 401) {
    return reply.continue();
  }

  return reply.view('errors/404', request.locals);
});

server.register({ register: require('hapi-etags') }, checkHapiPluginError('hapi-etags'));
server.register({ register: require('./controllers') }, checkHapiPluginError('CoderDojo controllers'));

// Serve CSS files.
server.register({
  register: require('hapi-less'),
  options: {
    home: path.join(__dirname, './public/css'),
    route: '/css/{filename*}',
    less: {
      compress: true
    }
  }
}, checkHapiPluginError('hapi-less'));

// Set up Chairo and seneca, then start the server.
server.register({ register: Chairo, options: options }, function (err) {
  checkHapiPluginError('Chairo')(err);

  // server.register({ register: require('../chairo-cache') }, function (err) {
  //   checkHapiPluginError('chairo-cache')(err);

    var seneca = server.seneca;

    seneca
      // TODO // ng-web just serves a static file -- easy
      .use('ng-web')
      .use(require('../lib/users/user.js'))  
      // TODO // would need to replace passport with hapi equivalent (hapi-auth-cookie?), translate express functionality to hapi, and modify seneca-web
      .use('auth')
      // TODO // translate 1 express middleware to hapi
      .use('user-roles')
      // TODO // translate 1 express middleware to hapi
      .use('web-access')
//
//      .use(require('../lib'), { webclient: options.webclient });
    .use(require('../lib/auth/cd-auth.js'))
    .use(require('../lib/charter/cd-charter.js'))
    .use(require('../lib/dojos/cd-dojos.js'))
    .use(require('../lib/countries/cd-countries.js'))
    .use(require('../lib/users/cd-users.js'))
    .use(require('../lib/agreements/cd-agreements.js'))
    .use(require('../lib/badges/cd-badges.js'))
    .use(require('../lib/profiles/cd-profiles.js'))
    .use(require('../lib/events/cd-events.js'))
    .use(require('../lib/oauth2/cd-oauth2.js'))
    .use(require('../lib/config/cd-config.js'), options.webclient)
    .use(require('../lib/sys/cd-sys.js'));


    _.each(options.client, function(opts) {
      seneca.client(opts);
    });

    // // Potentially useful extra logging.

    // seneca.logroute( {level:'all' });

    // // capture seneca messages - leaving this here as we *may* do something with it
    // // if the debug level json is not good enough logging.
    // seneca.sub({}, captureAllMessages);
    // function captureAllMessages(args) {
    //   console.log('*** captured = ', JSON.stringify(args));
    // }
  
    // Use seneca-web middleware with Hapi.
    server.register({
      register: require('hapi-seneca'),
      options: {
        seneca: seneca,
        cors: true
      }
    }, function (err) {
      checkHapiPluginError('hapi-seneca')(err);

      server.start(function() {
        console.log('[%s] Listening on http://localhost:%d', env, port);
      });
//    });
  });  
});

