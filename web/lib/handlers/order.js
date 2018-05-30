const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Order = require('../models/order');
const Email = require('../models/event-emails');
const Event = require('../models/event');

const get = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, next) => {
      const userId = req.params.userId;
      const query = Object.assign({}, req.query, { 'query[userId]': userId });
      const orders = await Order.get(query);
      return reply(orders).code(200);
    }),
  ]);

const post = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    async (req, reply, next) => {
      const userId = req.user.user.id;
      const eventId = req.params.eventId;
      const applications = req.payload.applications;
      const body = Object.assign({}, req.body, { userId, eventId, applications });
      req.app.order = await Order.post(body);
      reply(req.app.order).code(200);
      return next();
    },
    // Load Event
    async (req, reply, next) => {
      req.app.event = (await Event.get({ 'query[id]': req.app.order.eventId, 'query[dojoId]': req.app.order.applications[0].dojoId, related: 'sessions' })).results[0];
      return next();
    },
    async (req, reply, next) => {
      const event = req.app.event;
      return req.seneca.act({ role: 'cd-dojos', ctrl: 'dojo', cmd: 'load', id: event.dojoId },
        (err, res) => {
          if (err) return next(err);
          req.app.dojo = res;
          return next();
      });
    },
    async (req, reply, next) => {
      const event = req.app.event;
      return req.seneca.act({ role: 'cd-events', cmd: 'is_ticketing_admin', user: req.user.user, eventInfo: { dojoId: event.dojoId } },
        (err, res) => {
          if (err) return next(err);
          req.app.isTicketingAdmin = res.allowed;
          return next();
      });
    },
    // Email ordering user about kids info
    async (req, reply, next) => {
      const { event, order, dojo, context } = req.app;
      Email.sendAdultBooking(context.locality, req.user.user, event, order, dojo);
      return next();
    },
    // Email Dojo if required
    async (req, reply, next) => {
      const { event, order, dojo, context, isTicketingAdmin } = req.app;
      if (event.notifyOnApplicant && !isTicketingAdmin) {
        Email.sendDojoNotification(context.locality, event, order, dojo);
      }
      return next();
    },
  ]);

const put = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const orderId = req.params.orderId;
      const applications = req.payload.applications;
      const order = await Order.put(orderId, { applications });
      return reply(order).code(200);
    }),
  ]);

module.exports = {
  get,
  post,
  put,
};
