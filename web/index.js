'use strict';

require('newrelic');

var Hapi = require('hapi');
var path = require('path');
var requireindex = require('requireindex');

var env = process.env.NODE_ENV || 'development';
var so = require('./options.' + env  + '.js');

// TODO
// var options = {
//     onconfig: function (config, next) {
//       var sessionConfig = require('./config/sessions.json')
//       // reset the redis host here for docker or localhost
//       sessionConfig.module['arguments'].push(so.redis)
//       next(null, config);
//     }
// }

var port = process.env.PORT || 8000
var server = module.exports = new Hapi.Server()

server.connection({ port: port })

server.views({
  engines: { dust: require('hapi-dust') },
  path: path.join(__dirname, './public/templates'),
  partialsPath: path.join(__dirname, './public/templates/common')
})

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
        console.log('Failed loading hapi-less: %s', err);
    }
});

// TODO ? // 
require('./lib/dust-i18n.js');



// TODO ? // app.use(bodyparser.urlencoded({ extended: true }))
// TODO ? // app.use(bodyparser.json({ limit: so.bodyparser.json.limit }))

// TODO // app.use(session({ store: sessionStore, secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

var controllers = requireindex('./web/controllers');

// TODO
// _.each(controllers, function (controller) { 
//   server.route(controller);
// })

server.route(controllers.index);
server.route(controllers.locale);

server.route({
    method: 'GET',
    path: '/{filename*}',
    handler: {
        directory: {
            path: path.join(__dirname, 'public')
        }
    }
});

// TODO check lib/auth/cd-auth.js for middleware that may or may not be active
//      this route serves the static file from that directory
server.route({
    method: 'GET',
    path: '/content/auth/{filename*}',
    handler: {
        directory: {
            path: path.join(__dirname, '../lib/auth/public')
        }
    }
});

server.register({
  register: require('hapi-seneca'),
  options: {
    seneca: require('seneca')(),
    cors: true
  }
}, function (err) {
  if (err) {
    console.error(err);
  }

  server.start(function() {
    console.log('[%s] Listening on http://localhost:%d', env, port);
  });
});
