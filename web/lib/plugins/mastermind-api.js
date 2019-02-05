const senecaWebErrorHandler = require('../seneca-web-error-handler');
const cpPermissionsPreHandler = require('../cp-permissions-pre-handler');
const dojo = require('../../api/mastermind/dojo.js');
const event = require('../../api/mastermind/event.js');
const user = require('../../api/mastermind/user.js');
const order = require('../../api/mastermind/order.js');

exports.register = (server, options, next) => {
  server.ext('onPreResponse', senecaWebErrorHandler, { sandbox: 'plugin' });
  server.ext('onPreHandler', cpPermissionsPreHandler, { sandbox: 'plugin' });

  const registerRoute = (route) => {
    server.route(route);
  };
  dojo.forEach(registerRoute);
  event.forEach(registerRoute);
  order.forEach(registerRoute);
  user.forEach(registerRoute);
  next();
};

exports.register.attributes = {
  name: 'cd-matermind-apis',
};
