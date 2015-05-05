'use strict';

var cookieparser = require('cookie-parser')
var bodyparser   = require('body-parser')
var session      = require('express-session')


var kraken = require('kraken-js')
var app = require('express')()
var env = process.env.NODE_ENV || 'development';
var so = require('./options.' + env  + '.js');

var options = {
  onconfig: function (config, next) {
    next(null, config);
  }
}
var port = process.env.PORT || 8000



app.use(kraken(options))


app.use(cookieparser())

app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json({ limit: so.bodyparser.json.limit }))

app.use(session({ secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

app.listen(port, function (err) {
    console.log('[%s] Listening on http://localhost:%d', app.settings.env, port);
})