const Joi = require('joi');

module.exports = (fields) => {
  return {
    base: Joi.object().keys({
      orderBy: fields,
      page: Joi.number(),
      pageSize: Joi.number(),
    }),
  };
}
