const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Event = require('../models/event');

const get = (
  params // eslint-disable-line no-unused-vars
) =>
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const { dojoId } = req.params;
      const query = Object.assign({}, req.query, { 'query[dojoId]': dojoId });
      let events;
      let contentType = 'application/json';
      if (req.params.format && req.params.format === '.ics') {
        events = await Event.getICS(query);
        contentType = 'text/calendar';
      } else {
        events = await Event.get(query);
      }
      return reply(events)
        .header('Content-type', contentType)
        .code(200);
    }),
  ]);

const load = (
  params // eslint-disable-line no-unused-vars
) =>
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const { eventId } = req.params;
      const query = Object.assign({}, req.query);
      const event = await Event.load(eventId, query);
      return reply(event).code(200);
    }),
  ]);

const create = () =>
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const { payload } = req;
      const event = await Event.create(payload);
      return reply(event).code(200);
    }),
  ]);

module.exports = {
  get,
  load,
  create,
};
