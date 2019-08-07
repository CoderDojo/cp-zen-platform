const _ = require('lodash');

exports.register = function(server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0/sys' }, eOptions);

  function pingHandler(request, reply) {
    reply({ status: 'ok' });
  }

  server.route([
    {
      method: 'GET',
      path: `${options.basePath}/ping`,
      handler: pingHandler,
      config: {
        description: 'Ping endpoint',
        notes: 'Returns the status of the server',
        tags: ['api'],
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'api-sys',
};
