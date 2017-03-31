'use strict';

var _ = require('lodash');

module.exports.register = function (server, options, next) {

  _.each(options.handlers, function (handler) {
    server.expose(handler, require('./' + handler));
  });
  // Add all the server routes from the controllers.
  server.ext('onPreResponse', function (request, reply) {
    if (_.isObject(request.route.settings.plugins.senecaPreloader) &&
      _.isString(request.route.settings.plugins.senecaPreloader.handler)) {
      var handler = request.route.settings.plugins.senecaPreloader.handler;
      server.plugins.senecaPreloader[handler](request, function (preloaded) {
        request.locals.context.preload = preloaded;
        request.locals.context.preload.url = request.connection.info.protocol + '://' + request.info.host + request.url.path;
        request.locals.context.preload.image.push('https://zen.coderdojo.com/components/cd-common/images/coderdojo-logo-light-bg.svg');
        reply.continue();
      });
    } else {
      reply.continue();
    }
  });
};

module.exports.register.attributes = {
  name: 'senecaPreloader'
};
