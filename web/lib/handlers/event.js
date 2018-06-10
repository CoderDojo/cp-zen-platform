const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Event = require('../models/event');
const ICS = require('../models/ics');

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


// v2 extended to allow ics generation
const post = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    (req, reply, cb) => {
      const user = req.user;
      const { eventInfo, eventId } = req.payload;
      return req.seneca.act({ role: 'cd-events', cmd: 'saveEvent', eventInfo, eventId, user },
        (err, event) => {
          if (err) return cb(err);
          req.app.event = event;
          reply(event).code(200);
          cb();
      });
    },
    (req, reply, next) => {
      ICS.save(req.app.event);
      return next();
    },
  ]);

module.exports = {
  get,
  post,
};
