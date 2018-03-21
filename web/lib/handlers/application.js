const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Application = require('../models/application');

const list = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const { dojoId, eventId } = req.params;
      const query = Object.assign({}, req.query, { 'query[dojoId]': dojoId, 'query[eventId]': eventId });
      const applications = await Application.get(query);
      return reply(applications).code(200);
    }),
  ]);

module.exports = {
  list,
};
