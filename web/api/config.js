

const _ = require('lodash');
const joi = require('joi');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);

  function getConfigHandler(request, reply) {
    const { key } = request.query;
    if (!options[key]) {
      reply('Config key not found').code(404);
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
