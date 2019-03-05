const queryFields = require('./query');
const Joi = require('joi');

const fields = ['startTime', 'endTime', 'status'];
const query = queryFields(fields);
const definitions = {
  status: Joi.string().valid('draft', 'published', 'canceled'),
  beforeDate: Joi.date().timestamp().raw(),
  afterDate: Joi.date().timestamp().raw(),
  isPublic: Joi.number().valid(0, 1),
  related: Joi.string().valid('sessions', 'sessions.tickets'),
  utcOffset: Joi.number().integer(),
};
module.exports = {
  base: query.base,
  definitions,
  fields,
};
