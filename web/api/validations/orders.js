const queryFields = require('./query');
const Joi = require('joi');

const fields = ['createdAt'];
const query = queryFields(fields);
const definitions = {
  applications: Joi.array(),
};
module.exports = {
  base: query.base,
  definitions,
  fields,
};
