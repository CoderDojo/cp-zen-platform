const queryFields = require('./query');
const Joi = require('joi');

const query = queryFields(['lastEdited', 'when']);
const definitions = {
  email: Joi.string().email(),
};
module.exports = {
  base: query.base,
  definitions,
};
