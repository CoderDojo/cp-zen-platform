const senecaWebErrorHandler = require('../seneca-web-error-handler');
const cpPermissionsPreHandler = require('../cp-permissions-pre-handler');
const dojo = require('../../api/mastermind/dojo.js');

exports.register = (server, options, next) => {
  server.ext('onPreResponse', senecaWebErrorHandler, { sandbox: 'plugin' });
  server.ext('onPreHandler', cpPermissionsPreHandler, { sandbox: 'plugin' });

  dojo.forEach((route) => {
    server.route(route);
  });
  next();
};

exports.register.attributes = {
  name: 'cd-matermind-apis',
};
