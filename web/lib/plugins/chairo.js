const chairo = require('chairo');
const cache = require('chairo-cache');

exports.register = (server, options, next) => {
  server.register({ register: chairo, options }, (err) => {
    if (err) return next(err);

    server.register({
      register: cache,
      options: { cacheName: 'cd-cache' },
    }, (regErr) => {
      if (regErr) return next(regErr);
      const seneca = server.seneca;
      options.clients.forEach((opts) => {
        seneca.client(opts);
      });
      next();
    });
  });
};

exports.register.attributes = {
  name: 'cd-chairo',
};
