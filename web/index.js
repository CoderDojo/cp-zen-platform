
const env = process.env.NODE_ENV || 'development';
if (process.env.NEW_RELIC_ENABLED === 'true') require('newrelic'); // eslint-disable-line global-require
const _ = require('lodash');
const hapi = require('hapi');
// Plugins
const inert = require('inert');
const blipp = require('blipp');
const cpZenFrontend = require('cp-zen-frontend');
const hapiEtags = require('hapi-etags');
const ip2country = require('hapi-ip2country-plugin');
const vision = require('./lib/plugins/vision');
const cdAuth = require('./lib/plugins/auth');
const scooterAndBlankie = require('./lib/plugins/scooterAndBlankie');
const controllers = require('./controllers');
const senecaPreloaders = require('./lib/plugins/seneca-preloader-dustjs');
const chairo = require('./lib/plugins/chairo');
const apis = require('./lib/plugins/apis');
const logging = require('./lib/plugins/good');
const swagger = require('./lib/plugins/swagger');
// Libs
const options = require('./config/options.js');
const locale = require('locale');
const languages = require('./config/languages.js');
const cuid = require('cuid');
const crypto = require('crypto');
const os = require('os');
const debug = require('debug')('cp-zen-platform:index');
const errorHandlers = require('./lib/http-error-handler');

require('./lib/dust-i18n.js');
require('./lib/dust-loadjs.js');
require('./lib/dust-load-open-graph.js');

exports.start = function () {
  const availableLocales = new locale.Locales(_.pluck(languages, 'code'));
  const server = new hapi.Server(options.hapi);
  const port = process.env.PORT || 8000;
  const host = process.env.HOSTNAME || '127.0.0.1';
  const protocol = process.env.PROTOCOL || 'http';
  const hostWithPort = `${protocol}://${host}:${port}`;
  const uid = cuid();
  const hasher = crypto.createHash('sha256');
  hasher.update(os.hostname());
  const hostUid = `${hasher.digest('hex')}-${uid}`;
  server.method('getUid', () => hostUid);

  // Set up HAPI
  server.connection({
    port,
    // According to the HTTP spec and Chrome audit tool, Cache-Control headers should match what
    // would be sent for 200 when a 304 (Not Modified) is sent.
    routes: {
      cache: { statuses: [200, 304] },
      cors: { origin: [hostWithPort, 'https://changex.org', 'https://coderdojo.com', 'http://localhost'], credentials: true },
    },
  });

  server.register(
    [
      { register: vision },
      { register: inert },
      { register: blipp },
      { register: ip2country,
        routes: {
          prefix: '/api/2.0/ip-country-details',
        },
      },
      { register: cdAuth },
      { register: hapiEtags, options: { varieties: ['plain', 'buffer', 'stream'] } },
      { register: scooterAndBlankie },
      { register: logging },
      { register: swagger },
      { register: chairo, options },
      { register: apis },
      { register: senecaPreloaders,
        options: { handlers: ['seneca-event-preloader', 'seneca-dojo-preloader'] } },
      { register: controllers },
      { register: cpZenFrontend },
    ],
  )
    .then(() => {
      server.start((err) => {
        if (err) throw err;
        console.log('[%s] Listening on http://localhost:%d', env, port);
      });
    })
    .catch((err) => {
      throw err;
    });

  function locality(request) {
    const localesFormReq = (request.state && request.state.NG_TRANSLATE_LANG_KEY && request.state.NG_TRANSLATE_LANG_KEY.replace(/"/g, ''))
      || request.headers['accept-language'];

    const requestLocales = new locale.Locales(localesFormReq);

    return requestLocales.best(availableLocales).code;
  }

  server.method('locality', locality, {});

  // TODO : check if redir is not done by AWS
  if (env === 'production' || env === 'staging') {
    server.ext('onRequest', (request, reply) => {
      if (request.headers['x-forwarded-proto'] !== 'https') {
        return reply.redirect(`https://${request.headers.host}${request.path}`);
      }
      return reply.continue();
    });
  }

  server.ext('onPreAuth', (request, reply) => {
    const arrTranslateCookie = request.state && request.state.NG_TRANSLATE_LANG_KEY;
    let translateCookie = arrTranslateCookie;
    if (_.isArray(arrTranslateCookie)) {
      [translateCookie] = arrTranslateCookie;
    }
    const localesFormReq = (translateCookie && translateCookie.replace(/"/g, ''))
      || request.headers['accept-language'];

    const requestLocales = new locale.Locales(localesFormReq);

    request.app.context = {
      locality: requestLocales.best(availableLocales).code,
    };
    return reply.continue();
  });

  //  TODO: merge onPreResponses cause they conflict
  // Handler for 404/401
  server.ext('onPreResponse', (request, reply) => {
    //  TODO: separate Boom errors from others
    //  Add instanceId for tracking
    if (_.has(request.response, 'header')) request.response.header('cp-host', hostUid);
    if (_.has(request.response, 'output')) request.response.output.headers['cp-host'] = hostUid;

    const status = _.has(request, 'response.output.statusCode') ? request.response.output.statusCode : 200;

    if (status === 400) {
      request.log(['error', '400'], { status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details') ? request.response.data.details : request.response.output }, Date.now());
    }
    // if it's an api call, continue as normal..
    if (request.url.path.indexOf('/api/2.0') === 0) {
      return reply.continue();
    }

    // Hapi-auth redirect on failure for cdf portal
    // Others routes are handled by the default redirect of auth-cookie
    // Or should not be handled (403 permissions)
    if (status === 403) {
      if (request.route.settings.auth &&
        request.route.settings.auth.access.length > 0 &&
        request.route.settings.auth.access[0].scope.selection.length > 0) {
        const cdfPath = request.route.settings.auth.access[0].scope.selection.indexOf('cdf-admin') > -1;
        if (cdfPath) {
          return reply.redirect(`/cdf/login?next=${request.url.path}`);
        }
      }
      // TODO : if 403, we should kick out.
    }

    if (status !== 404 && status !== 401) {
      return reply.continue();
    }

    request.log(['error', '40x'], { status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details') ? request.response.data.details : request.response.output }, Date.now());
    debug('onPreResponse', 'showing 404 errors page');
    return reply.view('index', request.app);
  });

  // Handler for 500
  server.ext('onPreResponse', errorHandlers(server));
};
