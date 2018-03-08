const mastermind = require('../mastermind');
const Event = require('../models/event');

const role = 'cd-events';
const get = params => // eslint-disable-line no-unused-vars
  mastermind([
    async (req, reply, cb) => {
      const { dojoId } = req.params;
      const query = Object.assign({}, req.query, { 'query[dojoId]': dojoId });
      const events = await Event.get(query);
      return reply(events).code(200);
    },
  ]);

module.exports = {
  get,
};
