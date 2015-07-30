'use strict';

var pkg = require('./package');

module.exports.register = function (server, options, next) {
  var seneca = this;

  seneca.use(require('./mapping', { server: server });

  server.mapping = function (use, done) {
    seneca.act({ role: 'web', hapi: true, use: use }, function (err, results) {
      if (err && !done) throw err;
      if (!done) return;
      if (err) return done(err);
      done(null, results);
    });
  });
};

module.exports.register.attributes = { pkg: pkg };
