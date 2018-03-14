const Joi = require('joi');

module.exports = fields => ({
  base: Joi.object().keys({
    orderBy: fields,
    page: Joi.number(),
    pageSize: Joi.number(),
    direction: Joi.string(),
    related: Joi.string(),
  }),
});
