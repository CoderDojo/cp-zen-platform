const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Event = require('../models/event');

const get = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const { dojoId } = req.params;
      const query = Object.assign({}, req.query, { 'query[dojoId]': dojoId });
      const events = await Event.get(query);
      return reply(events).code(200);
    }),
  ]);

module.exports = {
  get,
};
