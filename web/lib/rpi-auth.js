const oauth2 = require('simple-oauth2');
const jwt = require('jsonwebtoken');
const { URLSearchParams } = require('url');

const authServer = process.env.RPI_AUTH_URL;
const homeServer = process.env.HOSTED_URL;
const tokenServer = process.env.RPI_TOKEN_URL || authServer;
const profileServer = process.env.RPI_PROFILE_URL;
const clientSecret = process.env.RPI_CLIENT_SECRET;
const clientId = process.env.RPI_CLIENT_ID;
const rpiZenAccountPassword = process.env.RPI_ZEN_ACCOUNT_PWORD;

const profileOauthPath = '/oauth2/auth';
const profileTokenPath = '/oauth2/token';
const profileSignupPath = '/signup';
const profileEditPath = '/profile/edit';
const profileLogoutPath = '/logout';
const loginPath = '/rpi/login';
const callbackPath = '/rpi/cb';
const accountTypePath = '/account-type';

const brand = 'coderdojo';
const scope = 'openid email profile force-consent';

// Initialize the OAuth2 Library
const oauth2Rpi = oauth2.create({
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    authorizeHost: authServer,
    authorizePath: profileOauthPath,
    tokenHost: tokenServer,
    tokenPath: profileTokenPath,
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

function getRedirectUri(state) {
  return oauth2Rpi.authorizationCode.authorizeURL({
    redirect_uri: `${homeServer}${callbackPath}`,
    scope,
    state,
    brand,
  });
}

function getIdToken(code) {
  return oauth2Rpi.authorizationCode
    .getToken({ code, redirect_uri: `${homeServer}${callbackPath}` })
    .then(function(result) {
      const tokenResult = oauth2Rpi.accessToken.create(result);
      return tokenResult && tokenResult.token && tokenResult.token.id_token;
    });
}

function decodeIdToken(idToken) {
  return jwt.decode(idToken);
}

function verifyIdTokenPayload(idTokenPayload) {
  const epochSeconds = Math.floor(new Date().getTime() / 1000);
  const isIssueTimeValid = idTokenPayload.iat <= epochSeconds;
  const isNotExpired = idTokenPayload.exp > epochSeconds;
  const isIssuerValid = idTokenPayload.iss === process.env.RPI_AUTH_URL;
  return isIssueTimeValid && isNotExpired && isIssuerValid;
}

function registerRpiStateCookie(server) {
  server.state('rpi-state', {
    ttl: 10 * 60 * 1000, // 10 minutes
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    isSameSite: 'Lax',
    encoding: 'iron',
    password:
      process.env.COOKIE_SECRET ||
      'SecretsNeverLastLongAndThisOneNeedsToBe32Char',
    clearInvalid: true,
    strictHeader: true,
    path: '/',
  });
}

function setRpiStateCookie(reply, state) {
  reply.state('rpi-state', state);
}

function getRpiStateCookie(request) {
  return request.state['rpi-state'];
}

function clearRpiStateCookie(reply) {
  return reply.unstate('rpi-state');
}

function getAccountTypeRedirectUrl(incomingQuery) {
  const incomingParams = new URLSearchParams(incomingQuery);
  return `${accountTypePath}?${incomingParams}`;
}

module.exports = {
  decodeIdToken,
  getRedirectUri,
  getIdToken,
  getRegisterRedirectUri,
  getLogoutRedirectUri,
  rpiZenAccountPassword,
  getEditRedirectUri,
  registerRpiStateCookie,
  setRpiStateCookie,
  getRpiStateCookie,
  clearRpiStateCookie,
  getAccountTypeRedirectUrl,
  verifyIdTokenPayload,
};
