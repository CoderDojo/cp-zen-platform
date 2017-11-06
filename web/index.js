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
const errorHandlers = require('./lib/http-error-handler');
const onPreResponse = require('./lib/on-pre-response');
const onPreAuth = require('./lib/on-pre-auth');

require('./lib/dust-i18n.js');
require('./lib/dust-loadjs.js');
require('./lib/dust-load-open-graph.js');

exports.start = () => {
  const port = process.env.PORT || 8000;
  const uid = cuid();
  const hasher = crypto.createHash('sha256');
  hasher.update(os.hostname());
  const server = new hapi.Server(options.hapi);
  server.app.availableLocales = new locale.Locales(_.pluck(languages, 'code'));
  server.app.hostUid = `${hasher.digest('hex')}-${uid}`;
  // Set up HAPI
  server.connection({
    port,
    routes: {
      // According to the HTTP spec and Chrome audit tool, Cache-Control headers should match what
      // would be sent for 200 when a 304 (Not Modified) is sent.
      cache: { statuses: [200, 304] },
      log: true,
    },
  });

  const registration = server
    .register([
      { register: vision },
      { register: inert },
      { register: blipp },
      {
        register: ip2country,
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
      {
        register: senecaPreloaders,
        options: { handlers: ['seneca-event-preloader', 'seneca-dojo-preloader'] },
      },
      { register: controllers },
      { register: cpZenFrontend },
    ])
    .then(() =>
      server.start().then(() => {
        console.log('[%s] Listening on http://localhost:%d', env, port);
      }),
    )
    .catch((err) => {
      throw err;
    });

  function locality(request) {
    const localesFormReq =
      (request.state &&
        request.state.NG_TRANSLATE_LANG_KEY &&
        request.state.NG_TRANSLATE_LANG_KEY.replace(/"/g, '')) ||
      request.headers['accept-language'];

    const requestLocales = new locale.Locales(localesFormReq);

    return requestLocales.best(server.app.availableLocales).code;
  }

  server.method('locality', locality, {});

  if (env === 'production' || env === 'staging') {
    server.ext('onRequest', (request, reply) => {
      if (request.headers['x-forwarded-proto'] !== 'https') {
        return reply.redirect(`https://${request.headers.host}${request.path}`);
      }
      return reply.continue();
    });
  }

  server.ext('onPreAuth', onPreAuth(server));

  //  TODO: merge onPreResponses cause they conflict
  // Handler for 404/401
  server.ext('onPreResponse', onPreResponse(server));

  // Handler for 500
  server.ext('onPreResponse', errorHandlers(server));
  return registration.then(() => server);
};
