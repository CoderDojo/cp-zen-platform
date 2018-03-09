const queryFields = require('./query');
const Joi = require('joi');

const fields = ['beforeDate', 'afterDate', 'status'];
const query = queryFields(fields);
const definitions = {
  status: Joi.string().valid('draft', 'published', 'canceled'),
  beforeDate: Joi.date().timestamp().raw(),
  afterDate: Joi.date().timestamp().raw(),
  public: Joi.number().valid(0, 1),
  utcOffset: Joi.number().integer(),
};
module.exports = {
  base: query.base,
  definitions,
  fields,
};
