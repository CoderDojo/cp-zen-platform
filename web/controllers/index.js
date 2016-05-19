'use strict';

var _ = require('lodash');
var path = require('path');
var requireindex = require('requireindex');
var controllers = requireindex(__dirname);
var cacheTimes = require('../config/cache-times');

// Remove package.json, it's not a controller.  All other non-index files/directories should be.
delete controllers.package;

module.exports.register = function (server, options, next) {
  // Add all the server routes from the controllers.

  _.each(controllers, function (controller) {
    server.route(controller);
  });

  // Serve public files
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
    handler: {
      file: {
        path: path.join(__dirname, '../public/favicon.ico')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/components/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/components')
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/img/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: cacheTimes.long } },
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
};

module.exports.register.attributes = {
  pkg: require('./package')
};
