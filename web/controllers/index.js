'use strict';

var _ = require('lodash');
var path = require('path');
var requireindex = require('requireindex');
var controllers = requireindex(__dirname);

var ASSET_LIFETIME =  60 * 60 * 1000; // 1 hr in ms // TODO move to config

// Remove package.json, it's not a controller.  All other non-index files/directories should be.
delete controllers.package;

module.exports.register = function (server, options, next) {
  // Add all the server routes from the controllers.
  _.each(controllers, function (controller) {
    server.route(controller);
  });

  // Serve public files
  // TODO cache this for a long time, it will rarely change
  server.route({
    method: 'GET',
    path: '/favicon.ico',
    config: { cache: { privacy: 'public', expiresIn: ASSET_LIFETIME } },
    handler: {
      file: {
        path: path.join(__dirname, '../public/favicon.ico')
      }
    }
  });

  // TODO Instead of serving these directly, bundle them and include all .js from versioned URLs.
  //      This will allow using 1 year (maximum value) for expiresIn, while not having to worry
  //      about old files stuck in the cache.
  server.route({
    method: 'GET',
    path: '/components/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: ASSET_LIFETIME } },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/components')
      }
    }
  });

  // TODO these can be cached for a year.  When the image content changes, it should be given
  //      a new filename/url to avoid any cache expiry issues.
  server.route({
    method: 'GET',
    path: '/img/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: ASSET_LIFETIME } },
    handler: {
      directory: {
        path: path.join(__dirname, '../public/img')
      }
    }
  });

  // TODO bundle + serve from a versioned URL
  server.route({
    method: 'GET',
    path: '/js/{filename*}',
    config: { cache: { privacy: 'public', expiresIn: ASSET_LIFETIME } },
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
