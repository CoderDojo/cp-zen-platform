'use strict';

var oauthserver = require('oauth2-server');

module.exports = function(options){
    var seneca = this;
    var plugin = 'cd-oauth';
    var version = '1.0';

    var model = require('./oauth-model')

    model.getAccessToken = function _getAccessToken (bearerToken, callback) {
            proxy({role: 'cd-oauth', cmd: 'getAccessToken', bearerToken: bearerToken}, callback);
        }



    var oauth = oauthserver({
        model: model,
        grants: ['authorization_code'],
        debug: true
    });



    function proxy(args, done) {
        var user = {};
        if(args.req$) user = args.req$.seneca.login.user;
        seneca.act(seneca.util.argprops(
            {user:user},
            args,
            {role: plugin}
        ), done);
    }

    function authorize (req, res, next){
        // this is my middleware function

        // if the route is my oauth URL, then act on it here, otherwise, call next() and move on.
        console.log('calling authorize')
        oauth.authCodeGrant(function (req, next) {
            // We're calling this authorized at this point, if we're here, you're authenticated.
            console.log('in auth code grant')
            var userObject = {
                "id": req.session.senecaUser.id,
                "name": req.session.senecaUser.name,
                "email": req.session.senecaUser.email
            };
            next(null, true, userObject)
        })

    }

    console.log(' calling include for my module');
    seneca.add({ init: plugin }, function (args, done) {
        var seneca = this;
        console.log('in seneca init for cd-oaouth');

        seneca.act({role: 'web', use: function (req, res, next) {
                // make this correct, christian says don't do it this way or he'll be mad
                console.log('in the middleware');
                console.log('request url: ', req.url)
                console.log('test url for user profile: ', /^\/oauth\/userprofile/.test(req.url))
                //console.log('req.seneca', req.seneca)
                if (/^\/oauth\/authorize/.test(req.url)) { // something wonderful is the endpoint.
                    oauth.authCodeGrant(function (req, next) {
                        // We're calling this authorized at this point, if we're here, you're authenticated.
                        console.log('in auth code grant')
                        var userObject = {
                            "id": req.seneca.user.id,
                            "name": req.seneca.name,
                            "email": req.seneca.email
                        };
                        next(null, true, userObject)
                    })(req, res, next)

                } else if(/^\/oauth\/token/.test(req.url)){
                    console.log('calling token')
                    oauth.grant()(req, res, next)
                } if(/^\/oauth\/userprofile/.test(req.url)){
                    console.log('returning user profile')
                    // this is only temporary, move this back itno the users service.
                    oauth.model.getAccessToken(req.query.access_token, function(err, user){
                        return res.send(user.userId.id)

                    })

                } else {
                //removing the else branch here doesn't render anything else, need to call something here to render the page.


                // with this in place, I get headers already sent.
                //return next()
                // wit this in place I get headers already sent.
                // next()
            }

            }
        });
        done();
    });

    return {
        name: plugin
    }

};