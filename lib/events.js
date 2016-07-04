'use strict';

var _ = require('lodash');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-events');

  server.route([{
    method: 'POST',
    path: options.basePath + '/events/save',
    handler: handlers.actHandlerNeedsUser('saveEvent', ['eventInfo', 'eventId']),
    config: {
      description: 'Save an event',
      tags: ['api', 'events']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/events/{id}',
    handler: handlers.actHandler('getEvent', 'id'),
    config: {
      description: 'Load event',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events',
    handler: handlers.actHandler('listEvents'),
    config: {
      description: 'List events',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/search',
    handler: handlers.actHandler('searchEvents'),
    config: {
      description: 'Search events',
      tags: ['api', 'events']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/events/applications/{eventId}',
    handler: handlers.actHandlerNeedsUser('loadEventApplications', 'eventId'),
    config: {
      description: 'Load event applications',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/applications/search',
    handler: handlers.actHandlerNeedsUser('searchApplications'),
    config: {
      description: 'Search applications',
      tags: ['api', 'events']
    }
  }, {
    method: 'DELETE',
    path: options.basePath + '/events/{eventId}/applications/{applicationId}',
    handler: handlers.actHandlerNeedsUser('deleteApplication', ['eventId', 'applicationId']),
    config: {
      description: 'Remove an application of an event',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/application',
    handler: handlers.actHandlerNeedsUser('saveApplication'),
    config: {
      description: 'Save an application',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/user-dojos-events',
    handler: handlers.actHandlerNeedsUser('userDojosEvents'),
    config: {
      description: 'User\'s events',
      tags: ['api', 'events']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/events/tickets/types',
    handler: handlers.actHandler('ticketTypes'),
    config: {
      description: 'List ticket types',
      tags: ['api', 'events']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/events/export-guest-list/dojo/{dojoId}/event/{eventId}/{status}',
    handler: handlers.actHandlerNeedsUser('exportGuestList'),
    config: {
      description: 'Export user list by event and status',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/sessions/search',
    handler: handlers.actHandler('searchSessions'),
    config: {
      description: 'Search a session',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/bulk-apply-applications',
    handler: handlers.actHandlerNeedsUser('bulkApplyApplications'),
    config: {
      description: 'Update applications by bulk',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/update-application-attendance',
    handler: handlers.actHandlerNeedsUser('updateApplicationAttendance'),
    config: {
      description: 'Update attendance of an application',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/session/cancel',
    handler: handlers.actHandlerNeedsUser('cancelSession'),
    config: {
      description: 'Cancel an event',
      tags: ['api', 'events']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/events/session/validate-invitation',
    handler: handlers.actHandlerNeedsUser('validateSessionInvitation'),
    config: {
      description: 'Validate an invitation',
      tags: ['api', 'events']
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-events'
};
