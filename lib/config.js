const _ = require('lodash');
const joi = require('joi');

exports.register = (server, args, next) => {
  const options = _.extend({ basePath: '/api/2.0' }, args);

  server.route([
    {
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
    },
  ]);

  function getConfigHandler({ query }, reply) {
    const key = query.key;
    if (!options[key]) {
      reply('Config key not found').code(404);
    } else {
      const ret = {};
      ret[key] = options[key];
      reply(ret);
    }
  }

  next();
};

exports.register.attributes = {
  name: 'api-config',
};
