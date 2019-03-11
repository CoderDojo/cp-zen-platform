const mastermind = require('../mastermind');
const Lead = require('../models/lead');

const list = params => // eslint-disable-line no-unused-vars
  mastermind([
    async (req, reply) => {
      const leads = await Lead.list(req.query);
      return reply(leads).code(200);
    },
  ]);

module.exports = {
  list,
};
