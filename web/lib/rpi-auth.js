const oauth2 = require('simple-oauth2');
const jwt = require('jsonwebtoken');
const { URLSearchParams } = require('url');

const homeServer = process.env.HOSTED_URL;
const loginPath = '/rpi/login';
const callbackPath = '/rpi/cb';
const authServer = process.env.RPI_AUTH_URL;
const authPath = '/oauth2/auth';
const tokenServer = process.env.RPI_TOKEN_URL || authServer;
const tokenPath = '/oauth2/token';
const profileServer = process.env.RPI_PROFILE_URL;
const profileSignupPath = '/signup';
const profileEditPath = '/profile/edit';
const profileLogoutPath = '/logout';
const clientId = process.env.RPI_CLIENT_ID;
const clientSecret = process.env.RPI_CLIENT_SECRET;
const brand = 'coderdojo';
const dummyState = '503aae3cf962412076589a264694606118ac63667deae839'; // use to persist state at point of return, need to add param to redirect url following sign up?
const scope = 'openid email profile force-consent';
const callbackUri = `${homeServer}${callbackPath}`;
const rpiZenAccountPassword = process.env.RPI_ZEN_ACCOUNT_PWORD;

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

function getLogoutRedirectUri() {
  const params = new URLSearchParams();
  params.set('returnTo', homeServer);
  return `${profileServer}${profileLogoutPath}?${params}`;
}

function getRegisterRedirectUri() {
  const params = new URLSearchParams();
  params.set('brand', brand);
  params.set('returnTo', `${homeServer}${loginPath}`);
  return `${profileServer}${profileSignupPath}?${params}`;
}

function getEditRedirectUri() {
  const params = new URLSearchParams();
  params.set('brand', brand);
  params.set('returnTo', `${homeServer}${loginPath}`);
  return `${profileServer}${profileEditPath}?${params}`;
}

function getRedirectUri(state = dummyState) {
  return oauth2Rpi.authorizationCode.authorizeURL({
    redirect_uri: callbackUri,
    scope,
    state,
    brand,
  });
}

function getIdToken(code) {
  return oauth2Rpi.authorizationCode
    .getToken({ code, redirect_uri: callbackUri })
    .then(function(result) {
      const tokenResult = oauth2Rpi.accessToken.create(result);
      return tokenResult && tokenResult.token && tokenResult.token.id_token;
    });
}

function decodeIdToken(idToken) {
  return jwt.decode(idToken);
}

module.exports = {
  decodeIdToken,
  getRedirectUri,
  getIdToken,
  getRegisterRedirectUri,
  getLogoutRedirectUri,
  rpiZenAccountPassword,
  getEditRedirectUri,
};
