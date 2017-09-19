'use strict';

var _ = require('lodash');
var preloaders = {};
preloaders['seneca-event-preloader'] = require('./seneca-event-preloader');
preloaders['seneca-dojo-preloader'] = require('./seneca-dojo-preloader');

exports.register = function (server, options, next) {
  _.each(options.handlers, function (handler) {
    server.expose(handler, preloaders[handler]);
  });
  // Add all the server routes from the controllers.
  server.ext('onPreHandler', function (request, reply) {
    if (_.isObject(request.route.settings.plugins.senecaPreloader) &&
      _.isString(request.route.settings.plugins.senecaPreloader.handler)) {
      var handler = request.route.settings.plugins.senecaPreloader.handler;
      server.plugins.senecaPreloader[handler](request, function (preloaded) {
        request.app.context.preload = preloaded;
        request.app.context.preload.url = request.connection.info.protocol + '://' + request.info.host + request.url.path;
        request.app.context.preload.image.push('https://zen.coderdojo.com/components/cd-common/images/coderdojo-logo-light-bg.svg');
        reply.continue();
      });
    } else {
      reply.continue();
    }
  });
  next();
};

exports.register.attributes = {
  name: 'senecaPreloader'
};
