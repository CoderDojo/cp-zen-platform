'use strict';

if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var Hapi = require('hapi');
var Chairo = require('chairo');
var path = require('path');
var senecaOptions = require('./options.' + env  + '.js');
var locale = require('locale');
var languages = require('./config/languages.js');

require('./lib/dust-i18n.js');

var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
var server = new Hapi.Server(options.hapi)
var port = process.env.PORT || 8000

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

server.register({ register: require('hapi-etag') });
server.register({ register: require('./controllers') }):
server.register({ register: require('./lib') });

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
}, function (err) {
  if (err) {
    console.error('Failed loading hapi-less:');
    throw err;
  }
});

// Set up Chairo and seneca, then start the server.
server.register({ register: Chairo, options: senecaOptions }, function (err) {
  if (err) { throw err; }

  var seneca = server.seneca;

  // TODO modify hapi-express to optionally allow calling these at the beginning of the request lifecycle
  seneca
    .use('../lib', { /* TODO */ })
    // TODO // ng-web just serves a static file -- easy
    .use('ng-web')
    // TODO // would need to replace passport with hapi equivalent, translate express functionality to hapi
    .use('auth')
    // TODO // translate 1 express middleware to hapi
    .use('user-roles')
    // TODO // translate 1 express middleware to hapi
    .use('web-access');

  _.each(senecaOptions.client, function(opts) {
    seneca.client(opts);
  });

  // TODO move this out of hapi-seneca
  // seneca.act({ role: 'web' }, { use: cookieparser() });
  // seneca.act({ role: 'web' }, { use: session({
  //   /*store: redisStore, */
  //   secret: 'seneca', 
  //   name: 'CD.ZENPLATFORM', 
  //   saveUninitialized: true, 
  //   resave: true 
  // }});

  //seneca.logroute( {level:'all' });

  // capture seneca messages - leaving this here as we *may* do something with it
  // if the debug level json is not good enough logging.
  /*
  seneca.sub({}, captureAllMessages);
  function captureAllMessages(args) {
    console.log('*** captured = ', JSON.stringify(args));
  }
  */

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
});

