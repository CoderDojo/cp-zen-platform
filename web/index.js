'use strict';

require('newrelic');

var bodyparser   = require('body-parser')
var session      = require('express-session')
var RedisStore = require('connect-redis')(session)



var kraken = require('kraken-js')
var app = require('express')()
var env = process.env.NODE_ENV || 'development';
var so = require('./options.' + env  + '.js');

var sessionStore = new RedisStore(so.redis)

var options = {
    onconfig: function (config, next) {
      var sessionConfig = require('./config/sessions.json')
      // reset the redis host here for docker or localhost
      sessionConfig.module['arguments'].push(so.redis)
      next(null, config);
    }
}
var port = process.env.PORT || 8000

app.use(kraken(options))

require('./lib/dust-i18n.js');


app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json({ limit: so.bodyparser.json.limit }))

app.use(session({ store: sessionStore, secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

app.listen(port, function (err) {
    console.log('[%s] Listening on http://localhost:%d', app.settings.env, port);
})
