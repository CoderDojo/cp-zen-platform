'use strict';

var _ = require('lodash');
exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-eventbrite');

  server.route([{
    method: 'POST',
    path: options.basePath + '/events/eventbrite/webhooks/{id}',
    handler: handlers.actHandler('handleWebhook', 'id'),
    config: {
      description: 'Handle webhook events from EventBrite',
      tags: ['api', 'events', 'eventbrite']
    }
  }]);
  next();
};

exports.register.attributes = {
  name: 'api-eventbrite'
};
