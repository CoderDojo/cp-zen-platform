const _ = require('lodash');

module.exports.register = (server, { handlers }) => {
  _.each(handlers, (handler) => {
    server.expose(handler, require(`./${handler}`)); // eslint-disable-line
  });
  // Add all the server routes from the controllers.
  server.ext('onPreHandler', (request, reply) => {
    if (
      _.isObject(request.route.settings.plugins.senecaPreloader) &&
      _.isString(request.route.settings.plugins.senecaPreloader.handler)
    ) {
      const handler = request.route.settings.plugins.senecaPreloader.handler;
      server.plugins.senecaPreloader[handler](request, (preloaded) => {
        request.locals.context.preload = preloaded;
        request.locals.context.preload.url = `${request.connection.info.protocol}://${request.info
          .host}${request.url.path}`;
        request.locals.context.preload.image.push(
          'https://zen.coderdojo.com/components/cd-common/images/coderdojo-logo-light-bg.svg',
        );
        reply.continue();
      });
    } else {
      reply.continue();
    }
  });
};

module.exports.register.attributes = {
  name: 'senecaPreloader',
};
