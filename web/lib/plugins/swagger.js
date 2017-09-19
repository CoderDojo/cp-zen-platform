const hapiSwagger = require('hapi-swagger');

exports.register = (server, options, next) => {
  // This can be turned off in production if needs be
  const noSwagger = process.env.NO_SWAGGER === 'true';
  if (!noSwagger) {
    const version = '2.0';
    const swaggerOptions = {
      info: {
        title: 'CoderDojo API',
        version,
      },
      tags: [
        {
          name: 'users',
        },
        {
          name: 'dojos',
        },
        {
          name: 'events',
        }],
    };
    server.register({
      register: hapiSwagger,
      options: swaggerOptions,
    }, next);
  }
};

exports.register.attributes = {
  name: 'cd-swagger',
};
