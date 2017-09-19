if (process.env.NEW_RELIC_ENABLED === 'true') require('newrelic'); // eslint-disable-line global-require

const env = process.env.NODE_ENV || 'development';

const _ = require('lodash');
const hapi = require('hapi');
const blankie = require('blankie');
const scooter = require('scooter');
const chairo = require('chairo');
const vision = require('vision');
const inert = require('inert');
const swagger = require('hapi-swagger');
const etags = require('hapi-etags');
const dust = require('hapi-dust');
const path = require('path');
const locale = require('locale');
const crypto = require('crypto');
const fs = require('fs-extra');
const os = require('os');
const blipp = require('blipp');
const cuid = require('cuid');
const hapiAuthCookie = require('hapi-auth-cookie');
const frontend = require('cp-zen-frontend');
const ip2country = require('hapi-ip2country-plugin');
const good = require('good');
const goodFile = require('good-file');
const goodHTTP = require('good-http');
const chairoCache = require('chairo-cache');
const debug = require('debug')('cp-zen-platform:index');
const languages = require('./config/languages.js');
const options = require('./config/options.js');
const controllers = require('./controllers');
const httpError = require('./lib/http-error-handler');
const preloader = require('./lib/plugins/seneca-preloader-dustjs');
const leads = require('../lib/leads.js');
const cdUsers = require('../lib/users.js');
const agreements = require('../lib/agreements.js');
const sys = require('../lib/sys.js');
const configRoute = require('../lib/config.js');
const oauth2 = require('../lib/oauth2.js');
const profiles = require('../lib/profiles.js');
const badges = require('../lib/badges.js');
const events = require('../lib/events.js');
const eventbrite = require('../lib/eventbrite.js');
const polls = require('../lib/polls.js');
const orgs = require('../lib/organisations.js');
const dojos = require('../lib/dojos.js');
const dustI18n = require('./lib/dust-i18n.js');
const dustLoadJs = require('./lib/dust-loadjs.js');
const dustLoadOG = require('./lib/dust-load-open-graph.js');

exports.start = () => {
  dustI18n();
  dustLoadJs();
  dustLoadOG();

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

  function checkHapiPluginError(name) {
    return (error) => {
      if (error) {
        console.error(`Failed loading a Hapi plugin: "${name}".`);
        throw error;
      }
    };
  }

  // Set up HAPI
  server.connection({
    port,
    // According to the HTTP spec and Chrome audit tool, Cache-Control headers should match what
    // would be sent for 200 when a 304 (Not Modified) is sent.
    routes: {
      cache: { statuses: [200, 304] },
      cors: {
        origin: [hostWithPort, 'https://changex.org', 'https://coderdojo.com', 'http://localhost'],
        credentials: true,
      },
    },
  });

  if (env === 'production' || env === 'staging') {
    server.ext('onRequest', (request, reply) => {
      if (request.headers['x-forwarded-proto'] !== 'https') {
        return reply.redirect(`https://${request.headers.host}${request.path}`);
      }
      reply.continue();
    });
  }

  server.register(inert, checkHapiPluginError('inert'));
  server.register(blipp, checkHapiPluginError('blipp'));
  server.register(frontend, checkHapiPluginError('cp-zen-frontend'));

  server.register(vision, (err) => {
    checkHapiPluginError('vision')(err);
    server.views({
      engines: { dust },
      path: [path.join(__dirname, './public/templates'), path.join(__dirname, './public/js/')],
      partialsPath: path.join(__dirname, './public/templates'),
    });
  });

  server.register(
    ip2country,
    {
      routes: {
        prefix: '/api/2.0/ip-country-details',
      },
    },
    checkHapiPluginError('ip2country'),
  );

  server.ext('onPreAuth', (request, reply) => {
    let translateCookie = request.state && request.state.NG_TRANSLATE_LANG_KEY;
    if (_.isArray(translateCookie)) {
      translateCookie = translateCookie[0];
    }
    const localesFormReq =
      (translateCookie && translateCookie.replace(/"/g, '')) || request.headers['accept-language'];
    const requestLocales = new locale.Locales(localesFormReq);
    request.locals = {
      context: {
        locality: requestLocales.best(availableLocales).code,
      },
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

    const status = _.has(request, 'response.output.statusCode')
      ? request.response.output.statusCode
      : 200;

    if (status === 400) {
      request.log(
        ['error', '400'],
        {
          status,
          host: server.methods.getUid(),
          payload: request.payload,
          params: request.params,
          url: request.url,
          user: request.user,
          error: _.has(request.response, 'data.details')
            ? request.response.data.details
            : request.response.output,
        },
        Date.now(),
      );
    }
    // if it's an api call, continue as normal..
    if (request.url.path.indexOf('/api/2.0') === 0) return reply.continue();

    // Hapi-auth redirect on failure for cdf portal
    // Others routes are handled by the default redirect of auth-cookie
    // Or should not be handled (403 permissions)
    if (status === 403) {
      if (_.has(request.route.settings, 'auth')) {
        const cdfPath = _.isEqual(
          request.route.settings.auth && request.route.settings.auth.scope,
          ['cdf-admin'],
        );
        if (cdfPath) {
          return reply.redirect(`/cdf/login?next=${request.url.path}`);
        }
      }
    }

    if (status !== 404 && status !== 401) return reply.continue();

    request.log(
      ['error', '40x'],
      {
        status,
        host: server.methods.getUid(),
        payload: request.payload,
        params: request.params,
        url: request.url,
        user: request.user,
        error: _.has(request.response, 'data.details')
          ? request.response.data.details
          : request.response.output,
      },
      Date.now(),
    );
    debug('onPreResponse', 'showing 404 errors page');
    return reply.view('index', request.locals);
  });

  // Handler for 500
  server.ext('onPreResponse', httpError(server));
  server.register(hapiAuthCookie, () => {
    server.auth.strategy('seneca-login', 'cookie', {
      password: process.env.COOKIE_SECRET || 'SecretsNeverLastLong',
      cookie: 'seneca-login',
      // TODO - what's the ttl on the express cookie??
      ttl: 2 * 24 * 60 * 60 * 1000, // two days
      path: '/',
      appendNext: true, // Redirect is not set here, but relative to the routes
      isSecure: false,
      validateFunc(request, session, callback) {
        const token = session.token;
        const cdfPath = _.isEqual(request.route.settings.auth.scope, ['cdf-admin']);
        getUser(request, token, (err, loggedInUser) => {
          if (loggedInUser) {
            if (
              loggedInUser.user.roles.indexOf('cdf-admin') > -1 &&
              cdfPath &&
              session.target === 'cdf'
            ) {
              return callback(null, true, { scope: 'cdf-admin' });
            }
            return callback(null, true, { scope: 'basic-user' }); // They're a `user`
          }
          return callback(null, false);
        });
      },
    });
  });

  // TODO - cache!
  function getUser({ seneca }, token, cb) {
    if (token) {
      seneca.act({ role: 'user', cmd: 'auth', token }, (err, resp) => {
        if (err) return cb(err);
        if (resp.ok === false) return cb('login not ok');
        return cb(null, resp);
      });
    } else {
      setImmediate(cb);
    }
  }

  server.register(
    { register: etags, options: { varieties: ['plain', 'buffer', 'stream'] } },
    checkHapiPluginError('hapi-etags'),
  );

  server.register(scooter, (err) => {
    checkHapiPluginError('scooter')(err);

    server.register(
      {
        register: blankie,
        options: {
          childSrc: "'none'",
          connectSrc:
            "'self' https://*.intercom.io wss://*.intercom.io https://api-ping.intercom.io https://*.amazonaws.com https://www.eventbrite.com",
          defaultSrc: "'none'",
          fontSrc: "'self' http://fonts.gstatic.com https://fonts.gstatic.com",
          frameSrc: 'https://www.google.com https://www.youtube.com',
          frameAncestors: "'none'",
          imgSrc: "'self' 'unsafe-eval' 'unsafe-inline' data: * blob: *",
          manifestSrc: "'none'",
          mediaSrc: "'none'",
          objectSrc: "'none'",
          reflectedXss: 'block',
          scriptSrc:
            "'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com http://www.google-analytics.com https://www.google-analytics.com http://www.googletagmanager.com https://www.googletagmanager.com https://maps.gstatic.com https://www.gstatic.com https://widget.intercom.io https://js.intercomcdn.com https://www.google.com https://apis.google.com http://cdn.optimizely.com/js/3847550948.js http://www.googleadservices.com/pagead/conversion.js ",
          styleSrc:
            "'self' 'unsafe-inline' http://fonts.googleapis.com https://fonts.googleapis.com",
        },
      },
      checkHapiPluginError('blankie'),
    );
  });

  server.register({ register: controllers }, checkHapiPluginError('CoderDojo controllers'));

  if (process.env.HAPI_DEBUG === 'true' || process.env.LOGENTRIES_ENABLED === 'true') {
    const goodOptions = {
      opsInterval: 1000,
      requestHeaders: true,
      requestPayload: true,
      responsePayload: true,
      reporters: [],
    };
    if (process.env.HAPI_DEBUG) {
      const goodLogFile = fs.existsSync('/var/log/zen')
        ? '/var/log/zen/hapi-zen-platform.log'
        : '/tmp/hapi-zen-platform.log';
      goodOptions.reporters.push({
        reporter: goodFile,
        events: { log: '*', response: '*' },
        config: goodLogFile,
      });
    }

    if (process.env.LOGENTRIES_ENABLED === 'true' && process.env.LOGENTRIES_TOKEN) {
      goodOptions.reporters.push({
        reporter: goodHTTP,
        events: { log: ['info'], error: '*', request: '*' },
        config: {
          endpoint: `https://webhook.logentries.com/noformat/logs/${process.env.LOGENTRIES_TOKEN}`,
          threshold: 0,
        },
      });
    }

    server.register({ register: good, options: goodOptions }, checkHapiPluginError('Good Logger'));
    server.log(['info'], { uid: hostUid }, Date.now());
  }

  server.register(dojos, checkHapiPluginError('dojos'));
  server.register(leads, checkHapiPluginError('leads'));
  server.register(cdUsers, checkHapiPluginError('users'));
  server.register(agreements, checkHapiPluginError('agreements'));
  server.register(sys, checkHapiPluginError('sys'));
  server.register(
    { register: configRoute, options: options.webclient },
    checkHapiPluginError('config'),
  );
  server.register(oauth2, checkHapiPluginError('oauth2'));
  server.register(profiles, checkHapiPluginError('profiles'));
  server.register(badges, checkHapiPluginError('badges'));
  server.register(events, checkHapiPluginError('events'));
  server.register(eventbrite, checkHapiPluginError('eventbrite'));
  server.register(polls, checkHapiPluginError('polls'));
  server.register(orgs, checkHapiPluginError('orgs'));

  server.register(
    {
      register: preloader,
      options: { handlers: ['seneca-event-preloader', 'seneca-dojo-preloader'] },
    },
    checkHapiPluginError('Seneca preloader'),
  );

  const locality = ({ state, headers }) => {
    const localesFormReq =
      (state && state.NG_TRANSLATE_LANG_KEY && state.NG_TRANSLATE_LANG_KEY.replace(/"/g, '')) ||
      headers['accept-language'];
    const requestLocales = new locale.Locales(localesFormReq);
    return requestLocales.best(availableLocales).code;
  };

  server.method('locality', locality, {});

  // This can be turned off in production if needs be
  const noSwagger = process.env.NO_SWAGGER === 'true';
  if (!noSwagger) {
    const version = '2.0';
    const swaggerOptions = {
      apiVersion: version,
      info: {
        title: 'CoderDojo API',
        version,
      },
      tags: [
        {
          name: 'users',
        },
        {
          name: 'dojos',
        },
        {
          name: 'events',
        },
      ],
    };
    server.register(
      {
        register: swagger,
        options: swaggerOptions,
      },
      checkHapiPluginError('hapi-swagger'),
    );
  }

  // Set up Chairo and seneca, then start the server.
  server.register({ register: chairo, options }, (err) => {
    checkHapiPluginError('Chairo')(err);
    server.register(
      {
        register: chairoCache,
        options: { cacheName: 'cd-cache' },
      },
      (error) => {
        checkHapiPluginError('chairo-cache')(error);
        const seneca = server.seneca;
        _.each(options.client, (opts) => {
          seneca.client(opts);
        });
        server.start(() => {
          console.log('[%s] Listening on http://localhost:%d', env, port);
        });
      },
    );
  });
};
