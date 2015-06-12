'use strict';

var bodyparser   = require('body-parser')
var session      = require('express-session')
var RedisStore = require('connect-redis')(session)



var kraken = require('kraken-js')
var app = require('express')()
var env = process.env.NODE_ENV || 'development';
var so = require('./options.' + env  + '.js');
var oauthserver = require('oauth2-server')

var sessionStore = new RedisStore(so.redis)

var options = {
    onconfig: function (config, next) {
      var sessionConfig = require('./config/sessions.json')
      // reset the redis host here for docker or localhost
      sessionConfig.module['arguments'].push(so.redis)
      next(null, config);
    }
}

app.oauth = oauthserver({
    model: require('../lib/auth/oauth-model'),
    grants: ['authorization_code'],
    debug: true
})

var port = process.env.PORT || 8000

app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json({ limit: so.bodyparser.json.limit }))

app.use(session({ store: sessionStore, secret: 'seneca', name: 'CD.ZENPLATFORM', saveUninitialized: true, resave: true }))

// oauth2 provider routes and configuration
app.use(app.oauth.errorHandler())
app.get('/oauth/authorize', function (req, res, next) {
        if(req.session.senecaUser){
            var user = req.session.senecaUser
            // check the 3 basic properties that NodeBB will require
            if((user["entity$"] === '-/sys/user') &&
                (user.id) && (user.email) &&
                (user.name)){
                // this addresses an issue w/in oauth2-server for the GET vs POST
                if(!req.body){
                    req.body = {}
                }
                next()
            } else {
                // something isn't right, so login again
                return res.redirect('/login')
            }
        } else {
            // log in to the main site.
            return res.redirect('/login')
        }
    },
    app.oauth.authCodeGrant(function (req, next) {
        console.log('in auth code grant')
        // We're calling this authorized at this point, if we're here, you're authenticated.
        next(null, true)
    })
)

app.post('/oauth/token', app.oauth.grant())

app.use(kraken(options))

require('./lib/dust-i18n.js');

app.listen(port, function (err) {
    console.log('[%s] Listening on http://localhost:%d', app.settings.env, port);
})
