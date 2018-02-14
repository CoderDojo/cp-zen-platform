const mastermind = require('../mastermind');
const role = 'cd-dojos';
const verify = (params) => {
  return mastermind([
    (req, reply, cb) => {
      const id = req.params.id;
      const verified = req.payload.verified;
      const user = req.user;
      return req.seneca.act({ role, ctrl: 'dojo', cmd: 'verify', id, verified, user }, 
        (err, res) => {
          if (err) return cb(err);
          return reply(res).code(200);
      });
    },
  ]);
}

module.exports = {
  verify,
}
