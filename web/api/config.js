

const _ = require('lodash');
const joi = require('joi');
const Boom = require('boom');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);

  function getConfigHandler(request, reply) {
    const { key } = request.query;
    if (!options[key]) {
      reply(Boom.notFound('Config key not found', key));
    } else {
      const ret = {};
      ret[key] = options[key];
      reply(ret);
    }
  }

  server.route([{
    method: 'GET',
    path: `${options.basePath}/config/get`,
    handler: getConfigHandler,
    config: {
      validate: {
        query: {
          key: joi.string(),
        },
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-config',
};
