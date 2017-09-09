'use strict';

exports.start = function () {

  if (process.env.NEW_RELIC_ENABLED === "true") require('newrelic');

  var env = process.env.NODE_ENV || 'development';

  var _ = require('lodash');
  var hapi = require('hapi');
  // Plugins
  var inert = require('inert');
  var blipp = require('blipp');
  var cpZenFrontend = require('cp-zen-frontend');
  var hapiEtags = require('hapi-etags');
  var ip2country = require('hapi-ip2country-plugin');
  var vision = require('./lib/plugins/vision');
  var cdAuth = require('./lib/plugins/auth');
  var scooterAndBlankie = require('./lib/plugins/scooterAndBlankie');
  var controllers = require('./controllers');
  var senecaPreloaders = require('./lib/plugins/seneca-preloader-dustjs');
  var chairo = require('./lib/plugins/chairo');
  var apis = require('./lib/plugins/apis');
  var logging = require('./lib/plugins/good');
  var swagger = require('./lib/plugins/swagger');
  // Libs
  var options = require('./config/options.js');
  var locale = require('locale');
  var languages = require('./config/languages.js');
  var cuid = require('cuid');
  var crypto = require('crypto');
  var os = require('os');
  var debug = require('debug')('cp-zen-platform:index');

  require('./lib/dust-i18n.js');
  require('./lib/dust-loadjs.js');
  require('./lib/dust-load-open-graph.js');

  var availableLocales = new locale.Locales(_.pluck(languages, 'code'));
  var server = new hapi.Server(options.hapi);
  var port = process.env.PORT || 8000;
  var host = process.env.HOSTNAME || '127.0.0.1';
  var protocol = process.env.PROTOCOL || 'http';
  var hostWithPort = protocol + '://' + host + ':' + port;
  var uid = cuid();
  var hasher = crypto.createHash('sha256');
  hasher.update(os.hostname());
  var hostUid = hasher.digest('hex') + '-' + uid;
  server.method('getUid', () => hostUid);

  // Set up HAPI
  server.connection({
    port: port,
    // According to the HTTP spec and Chrome audit tool, Cache-Control headers should match what
    // would be sent for 200 when a 304 (Not Modified) is sent.
    routes: {
      cache: { statuses: [200,304] },
      cors: { origin: [ hostWithPort, 'https://changex.org', 'https://coderdojo.com', 'http://localhost'], credentials: true }
    }
  });

  server.register(
    [
      {register: vision},
      {register: inert},
      {register: blipp},
      {register: ip2country ,
        routes: {
          prefix: '/api/2.0/ip-country-details'
        }
      },
      {register: cdAuth},
      {register: hapiEtags, options: { varieties: ['plain', 'buffer', 'stream'] }},
      {register: scooterAndBlankie},
      {register: logging},
      {register: swagger},
      {register: chairo, options: options},
      {register: apis},
      {register: senecaPreloaders,
        options: { handlers: ['seneca-event-preloader', 'seneca-dojo-preloader'] }},
      {register: controllers},
      {register: cpZenFrontend},
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

  var locality = function(request) {
    var localesFormReq = (request.state && request.state.NG_TRANSLATE_LANG_KEY && request.state.NG_TRANSLATE_LANG_KEY.replace(/\"/g, ''))
      || request.headers['accept-language'];

    var requestLocales = new locale.Locales(localesFormReq);

    return requestLocales.best(availableLocales).code;
  }

  server.method('locality', locality, {});

  // TODO : check if redir is not done by AWS
  if ('production' === env || 'staging' === env) {
    server.ext('onRequest', function(request, reply) {
      if (request.headers['x-forwarded-proto'] != 'https') {
        return reply.redirect('https://' + request.headers.host + request.path);
      }
      reply.continue();
    });
  }

  server.ext('onPreAuth', function (request, reply) {
    var translateCookie = request.state && request.state.NG_TRANSLATE_LANG_KEY;
    if (_.isArray(translateCookie)) {
      translateCookie = translateCookie[0];
    }
    var localesFormReq = (translateCookie && translateCookie.replace(/\"/g, ''))
      || request.headers['accept-language'];

    var requestLocales = new locale.Locales(localesFormReq);

    request.app.context = {
      locality: requestLocales.best(availableLocales).code
    };
    return reply.continue();
  });

  //  TODO: merge onPreResponses cause they conflict
  // Handler for 404/401
  server.ext('onPreResponse', function (request, reply) {
    //  TODO: separate Boom errors from others
    //  Add instanceId for tracking
    if (_.has(request.response, 'header')) request.response.header('cp-host', hostUid);
    if (_.has(request.response, 'output')) request.response.output.headers['cp-host'] = hostUid;

    var status = _.has(request, 'response.output.statusCode') ? request.response.output.statusCode : 200;

    if (status === 400) {
      request.log(['error', '400'], {status: status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details')? request.response.data.details: request.response.output}, Date.now());
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
        var cdfPath = request.route.settings.auth.access[0].scope.selection.indexOf('cdf-admin') > -1;
        if (cdfPath) {
          return reply.redirect('/cdf/login?next=' + request.url.path);
        }
      }
      // TODO : if 403, we should kick out.
    }

    if (status !== 404 && status !== 401) {
      return reply.continue();
    }

    request.log(['error', '40x'], {status: status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(request.response, 'data.details')? request.response.data.details: request.response.output}, Date.now());
    debug('onPreResponse', 'showing 404 errors page');
    return reply.view('index', request.app);
  });

  // Handler for 500
  server.ext('onPreResponse', require('./lib/http-error-handler')(server));
};
