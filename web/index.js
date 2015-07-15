'use strict';

require('newrelic');

var Hapi = require('hapi');
var path = require('path');
var env = process.env.NODE_ENV || 'development';
var so = require('./options.' + env  + '.js');

// TODO
var options = {
    onconfig: function (config, next) {
      var sessionConfig = require('./config/sessions.json')
      // reset the redis host here for docker or localhost
      sessionConfig.module['arguments'].push(so.redis)
      next(null, config);
    }
}

var server = new Hapi.Server()
var port = process.env.PORT || 8000

server.connection({ port: port })

server.views({
  engines: { dust: require('hapi-dust') },
  relativeTo: path.join(__dirname),
  path: 'public/templates',
  // TODO ? // helpersPath: 'path/to/helpers',
})

// TODO ? // require('./lib/dust-i18n.js');


// TODO ? // app.use(bodyparser.urlencoded({ extended: true }))
// TODO ? // app.use(bodyparser.json({ limit: so.bodyparser.json.limit }))

// TODO // app.use(session({ store: sessionStore, secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

server.start(function () {
    console.log('[%s] Listening on http://localhost:%d', env, port);
})
