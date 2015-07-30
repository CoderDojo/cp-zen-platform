'use strict';

var _ = require('lodash');
var path = require('path');
var controllers = requireindex(__dirname);

module.exports.register = function (server, options, next) {
  // Add all the server routes from the controllers.
  _.each(controllers, function (controller) {
    server.route(controller);
  });

  // Serve public files
  // These are separate to allow routes from seneca-web a change to have their middleware triggered.
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: {
        path: path.join(__dirname, '../public/favicon.ico')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/components/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/components')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/img/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/img')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/js/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../public/js')
      }
    }
  });

  // Serve the auth .js files, etc.
  server.route({
    method: 'GET',
    path: '/content/auth/{filename*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../../lib/auth/public')
      }
    }
  });

};

module.exports.register.attributes = {
  pkg: require('./package')
};
