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
    async (req, reply, next) => {
      const { payload } = req;
      req.sendEmails = payload.sendEmails;
      delete payload.sendEmails;
      const event = await Event.create(payload);
      req.eventId = event.id;
      req.dojoId = event.dojoId;
      reply(event).code(200);
      return next();
    },
    ...sendDojoEmails,
  ]);

const update = () =>
  mastermind([
    // eslint-disable-next-line no-unused-vars
    async (req, reply, next) => {
      const { payload } = req;
      const eventId = payload.id;
      req.sendEmails = payload.sendEmails;
      delete payload.sendEmails;
      const event = await Event.update(eventId, payload);
      req.eventId = event.id;
      req.dojoId = event.dojoId;
      reply(event).code(200);
      return next();
    },
    ...sendDojoEmails,
  ]);

const sendDojoEmails = [
  async (req, reply, next) => {
    if (req.sendEmails) {
      return req.seneca.act(
        {
          role: 'cd-dojos',
          cmd: 'notify_all_members',
          data: {
            dojoId: req.dojoId,
            eventId: req.eventId,
            emailSubject: 'Tickets Now Available for %1$s',
          },
        },
        err => {
          if (err) return next(err);
          return next();
        }
      );
    }
  },
];

module.exports = {
  get,
  load,
  create,
  update,
};
