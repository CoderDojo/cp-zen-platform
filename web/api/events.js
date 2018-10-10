

const _ = require('lodash');
const auth = require('../lib/authentications');
const Joi = require('joi');
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-events');

  server.route([{
    method: 'POST',
    path: `${options.basePath}/events/save`,
    handler: handlers.actHandlerNeedsUser('saveEvent', ['eventInfo', 'eventId']),
    config: {
      auth: auth.apiUser,
      description: 'Save an event',
      tags: ['api', 'events'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/events/{id}`,
    handler: handlers.actHandler('getEvent', 'id'),
    config: {
      auth: auth.userIfPossible,
      description: 'Load event',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'events'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/events/{id}/sessions`,
    handler: handlers.actHandler('getSessionsFromEventId', 'id'),
    config: {
      description: 'Load sessions for an event',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'events'],
      validate: {
        params: {
          id: Joi.string().guid(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/search`,
    handler: handlers.actHandler('searchEvents'),
    config: {
      description: 'Search events',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'events'],
      validate: {
        payload: Joi.object(),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/events/applications/{eventId}`,
    handler: handlers.actHandlerNeedsUser('loadEventApplications', 'eventId'),
    config: {
      auth: auth.apiUser,
      description: 'Load event applications',
      tags: ['api', 'events'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/user/events/{eventId}/applications`,
    handler: handlers.actHandlerNeedsUser('list', 'eventId', null, { ctrl: 'applications' }),
    config: {
      auth: auth.apiUser,
      description: 'Load user\'s applications (and its children) for this event',
      tags: ['api', 'events'],
      validate: {
        params: {
          eventId: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/applications/search`,
    handler: handlers.actHandlerNeedsUser('searchApplications'),
    config: {
      auth: auth.apiUser,
      description: 'Search applications',
      tags: ['api', 'events'],
      validate: {
        payload: Joi.object(),
      },
    },
  }, {
    method: 'DELETE',
    path: `${options.basePath}/events/{eventId}/applications/{applicationId}`,
    handler: handlers.actHandlerNeedsUser('deleteApplication', ['eventId', 'applicationId']),
    config: {
      auth: auth.apiUser,
      description: 'Remove an application of an event',
      tags: ['api', 'events'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/events/tickets/types`,
    handler: handlers.actHandler('ticketTypes'),
    config: {
      description: 'List ticket types',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'events'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/events/export-guest-list/dojo/{dojoId}/event/{eventId}/{status}-export.csv`,
    handler: handlers.actHandlerNeedsUser('exportGuestList', ['dojoId', 'eventId', 'status'], { type: 'csv' }),
    config: {
      auth: auth.apiUser,
      description: 'Export user list by event and status',
      tags: ['api', 'events'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/sessions/search`,
    handler: handlers.actHandler('searchSessions'),
    config: {
      auth: auth.userIfPossible,
      description: 'Search a session',
      cors: { origin: ['*'], credentials: false },
      tags: ['api', 'events'],
      validate: {
        payload: Joi.object(),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/bulk-apply-applications`,
    handler: handlers.actHandlerNeedsUser('bulkApplyApplications'),
    config: {
      auth: auth.apiUser,
      description: 'Update applications by bulk',
      tags: ['api', 'events'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/update-application-attendance`,
    handler: handlers.actHandlerNeedsUser('updateApplicationAttendance'),
    config: {
      auth: auth.apiUser,
      description: 'Update attendance of an application',
      tags: ['api', 'events'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/session/cancel`,
    handler: handlers.actHandlerNeedsUser('cancelSession'),
    config: {
      auth: auth.apiUser,
      description: 'Cancel an event',
      tags: ['api', 'events'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/ticket/{ticketId}/invitations/user/{userId}`,
    handler: handlers.actHandlerNeedsUser('validateSessionInvitation', ['ticketId', 'userId']),
    config: {
      auth: auth.apiUser,
      description: 'Validate an invitation',
      tags: ['api', 'events'],
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-events',
  dependencies: 'cd-auth',
};
