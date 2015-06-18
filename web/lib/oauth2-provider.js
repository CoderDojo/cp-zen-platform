'use strict';

var oauthserver = require('oauth2-server')

oauth = oauthserver({
    model: require('../lib/auth/oauth-model'),
    grants: ['authorization_code'],
    debug: true
});

module.exports = function oauth2Provider () {
    return function (req, res, next) {

        console.log('in authcodegrant callback')
        // We're calling this authorized at this point, if we're here, you're authenticated.
        var userObject = {
            "id": req.session.senecaUser.id,
            "name": req.session.senecaUser.name,
            "email": req.session.senecaUser.email
        };
        next(null, true, userObject)
    };
};
