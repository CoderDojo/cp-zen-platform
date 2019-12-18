const oauth2 = require('simple-oauth2');

const homeServer = process.env.HOSTED_URL;
const homeCallbackPath = '/rpi/cb';
const authServer = process.env.RPI_AUTH_URL;
const tokenServer = process.env.RPI_TOKEN_URL || authServer;
const authPath = '/oauth2/auth';
const tokenPath = '/oauth2/token';
const clientId = process.env.RPI_CLIENT_ID;
const clientSecret = process.env.RPI_CLIENT_SECRET;
const brand = 'coderdojo';
const dummyState = '503aae3cf962412076589a264694606118ac63667deae839'; // use to persist state at point of return, need to add param to redirect url following sign up?
const scope = 'openid email profile force-consent';
const callbackUri = `${homeServer}${homeCallbackPath}`;

// Initialize the OAuth2 Library
const oauth2Rpi = oauth2.create({
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    authorizeHost: authServer,
    authorizePath: authPath,
    tokenHost: tokenServer,
    tokenPath: tokenPath,
  },
});

function getRedirectUri(state = dummyState) {
  return oauth2Rpi.authorizationCode.authorizeURL({
    redirect_uri: callbackUri,
    scope,
    state,
    brand,
  });
}

function getToken(code) {
  return oauth2Rpi.authorizationCode
    .getToken({ code, redirect_uri: callbackUri })
    .then(function(result) {
      return oauth2Rpi.accessToken.create(result);
    });
}

module.exports = {
  getRedirectUri,
  getToken,
};
