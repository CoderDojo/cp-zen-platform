const queryFields = require('./query');
const Joi = require('joi');

const fields = ['createdAt'];
const query = queryFields(fields);
const definitions = {
  applications: Joi.array().items(Joi.object().keys({
    id: Joi.string().guid(),
    name: Joi.string(),
    dateOfBirth: Joi.date(),
    eventId: Joi.string().guid(),
    userId: Joi.string().guid(),
    sessionId: Joi.string().guid(),
    created: Joi.date(),
    dojoId: Joi.string().guid(),
    ticketId: Joi.string().guid(),
    ticketName: Joi.string(),
    ticketType: Joi.string(), // valid parent-guardian and such
    notes: Joi.string(),
    order_id: Joi.string().guid().optional(),
  })),
};
module.exports = {
  base: query.base,
  definitions,
  fields,
};
