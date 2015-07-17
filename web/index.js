'use strict';

require('newrelic');

var env = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var Hapi = require('hapi');
var path = require('path');
var requireindex = require('requireindex');
var controllers = requireindex('./web/controllers');
var so = require('./options.' + env  + '.js');
var seneca = module.exports = require('seneca')(so.main);

var server = new Hapi.Server()
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
  partialsPath: path.join(__dirname, './public/templates/common')
})

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
    console.error(err);
  }
});

// TODO does this work as-is? //
require('./lib/dust-i18n.js');



// TODO // app.use(session({ store: sessionStore, secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

// Add all the server routes from the controllers.
_.each(controllers, function (controller) { 
  server.route(controller);
})

// Serve public files
server.route({
  method: 'GET',
  path: '/{filename*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public')
    }
  }
});

// Serve the auth .js files, etc.
// TODO this breaks encapsulation in regards to the auth microservice
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
    console.error(err);
  }

  server.start(function() {
    console.log('[%s] Listening on http://localhost:%d', env, port);
  });
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
