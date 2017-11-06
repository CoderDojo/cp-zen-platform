const _ = require('lodash');

const preloaders = {};
preloaders['seneca-event-preloader'] = require('./seneca-event-preloader');
preloaders['seneca-dojo-preloader'] = require('./seneca-dojo-preloader');

exports.register = (server, options, next) => {
  _.each(options.handlers, (handler) => {
    server.expose(handler, preloaders[handler]);
  });
  // Add all the server routes from the controllers.
  server.ext('onPreHandler', (request, reply) => {
    if (_.isObject(request.route.settings.plugins.senecaPreloader) &&
      _.isString(request.route.settings.plugins.senecaPreloader.handler)) {
      const handler = request.route.settings.plugins.senecaPreloader.handler;
      server.plugins.senecaPreloader[handler](request, (err, preloaded) => {
        if (!err && preloaded) {
          request.app.context.preload = preloaded;
          request.app.context.preload.url = `${request.connection.info.protocol}://${request.info.host}${request.url.path}`;
          request.app.context.preload.image.push('https://zen.coderdojo.com/components/cd-common/images/coderdojo-logo-light-bg.svg');
        }
        reply.continue();
      });
    } else {
      reply.continue();
    }
  });
  next();
};

exports.register.attributes = {
  name: 'senecaPreloader',
};
