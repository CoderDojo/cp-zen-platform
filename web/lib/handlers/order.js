const { asyncify } = require('async');
const mastermind = require('../mastermind');
const Order = require('../models/order');

const get = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const userId = req.params.userId;
      const query = Object.assign({}, req.query, { 'query[userId]': userId });
      const orders = await Order.get(query);
      return reply(orders).code(200);
    }),
  ]);

const post = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    asyncify(async (req, reply, cb) => {
      const userId = req.user.user.id;
      const eventId = req.params.eventId;
      const applications = req.payload.applications;
      const body = Object.assign({}, req.body, { userId, eventId, applications });
      const order = await Order.post(body);
      return reply(order).code(200);
    }),
  ]);

module.exports = {
  get,
  post,
};
