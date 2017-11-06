const good = require('good');
const goodFile = require('good-file');
const goodHttp = require('good-http');
const fs = require('fs');

exports.register = (server, options, next) => {
  if (process.env.HAPI_DEBUG === 'true' || process.env.LOGENTRIES_ENABLED === 'true') {
    const goodOptions = {
      opsInterval: 1000,
      requestHeaders: true,
      requestPayload: true,
      responsePayload: true,
      reporters: [],
    };
    if (process.env.HAPI_DEBUG === 'true') {
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
        reporter: goodHttp,
        events: { log: ['info'], error: '*', request: '*' },
        config: {
          endpoint: `https://webhook.logentries.com/noformat/logs/${process.env.LOGENTRIES_TOKEN}`,
          threshold: 0,
        },
      });
    }

    server.register({ register: good, options: goodOptions }, () => {
      server.log(['info'], { uid: server.app.hostUid }, Date.now());
      next();
    });
  } else {
    next();
  }
};

exports.register.attributes = {
  name: 'cd-log',
};
