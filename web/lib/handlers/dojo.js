const mastermind = require('../mastermind');

const role = 'cd-dojos';
const verify = params => // eslint-disable-line no-unused-vars
  mastermind([
    (req, reply, cb) => {
      const id = req.params.id;
      const verified = req.payload.verified;
      const user = req.user;
      return req.seneca.act({ role, ctrl: 'dojo', cmd: 'verify', id, verified, user },
        (err, res) => {
          if (err) {
            // Add support for some of seneca's error message
            const message = err.details ? err.details.message : err.message;
            let expectedErr = err;
            if (['Dojo not found', 'Dojo email is missing', 'Invalid verification scenario'].indexOf(message) > -1) {
              expectedErr = new Error(message);
              expectedErr.statusCode = 400;
            }
            return cb(expectedErr);
          }
          reply(res).code(200);
          cb();
        });
    },
    (req, reply, cb) => {
      req.server.plugins.sitemap.refresh();
      cb();
    },
  ]);

const update = params => // eslint-disable-line no-unused-vars
  mastermind([
    (req, reply, cb) => {
      const dojo = req.payload.dojo;
      return req.seneca.act({ role, ctrl: 'dojo', cmd: 'save', dojo },
        (err, res) => {
          if (err) return cb(err);
          reply(res).code(200);
          cb();
        });
    },
    (req, reply, cb) => {
      req.server.plugins.sitemap.refresh();
      cb();
    },
  ]);

module.exports = {
  verify,
  update,
};
