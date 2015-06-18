'use strict';

var oauthserver = require('oauth2-server')

var oauth = oauthserver({
    model: require('../../../lib/auth/oauth-model'),
    grants: ['authorization_code'],
    debug: true
});


module.exports = function (router) {
    router.get('/authorize', oauth.authCodeGrant(function (req, res, next) {
        console.log('in authcodegrant callback')
        // We're calling this authorized at this point, if we're here, you're authenticated.
        var userObject = {
            "id": req.session.senecaUser.id,
            "name": req.session.senecaUser.name,
            "email": req.session.senecaUser.email
        };
        next(null, true, userObject)
    }), function (req, res) {

        console.log('would call authorize');
        // what am I supposed to do here?

    });

    router.get('/token', oauth.grant())

};
