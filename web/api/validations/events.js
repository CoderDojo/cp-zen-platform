const queryFields = require('./query');
const Joi = require('joi');

const fields = ['dateBefore', 'dateAfter', 'status'];
const query = queryFields(fields);
const definitions = {
  status: Joi.string().valid('draft', 'published', 'canceled'),
  dateBefore: Joi.date().timestamp(),
  dateAfter: Joi.date().timestamp(),
  utcOffset: Joi.number(),
};
module.exports = { 
  base: query.base,
  definitions,
  fields,
};
