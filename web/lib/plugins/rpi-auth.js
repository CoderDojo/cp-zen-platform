const { registerRpiStateCookie } = require('../rpi-auth');

exports.register = (server, options, next) => {
  registerRpiStateCookie(server);
  next();
};

exports.register.attributes = {
  name: 'cd-rpi-auth',
};
