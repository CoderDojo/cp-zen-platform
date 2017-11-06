const _ = require('lodash');
const path = require('path');
const requireindex = require('requireindex');

const controllers = requireindex(__dirname);
const cacheTimes = require('../config/cache-times');

exports.register = (server, options, next) => {
  // Add all the server routes from the controllers.

  _.each(controllers, (controller) => {
    server.route(controller);
  });

  // Serve public files
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
    handler: {
      file: {
        path: path.join(__dirname, '../public/favicon.ico'),
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/components/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/components'),
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/img/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/img'),
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/js/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/js'),
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/directives/tpl/{name*}',
    handler(request, reply) {
      reply.view(`directives/${request.params.name}/template.dust`, request.app);
    },
  });

  server.route({
    method: 'GET',
    path: '/dist/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/dist'),
      },
    },
  });
  next();
};

exports.register.attributes = {
  pkg: {
    name: 'controllers',
    version: '0.0.0',
  },
  name: 'cd-routes',
  dependencies: ['cd-auth', 'cd-vision', 'senecaPreloader'],
};
