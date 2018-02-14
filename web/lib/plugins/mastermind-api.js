const senecaWebErrorHandler = require('../seneca-web-error-handler');
const dojo = require('../../api/mastermind/dojo.js');

exports.register = function (server, options, next) {
  const apis = [dojo];

  apis.forEach((api) => {
    server.register(api, (err) => next(err));
  });

  server.ext('onPreResponse', senecaWebErrorHandler, { sandbox: 'plugin' });
  next();
};

exports.register.attributes = {
  name: 'cd-matermind-apis',
};
