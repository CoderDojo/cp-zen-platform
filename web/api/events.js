

const _ = require('lodash');
const auth = require('../lib/authentications');
const Joi = require('joi');
const handlerFactory = require('./handlers.js');
const joiValidator = require('./validations/dojos')();

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-events');

  server.route([{
    method: 'POST',
    path: `${options.basePath}/events/save`,
    handler: handlers.actHandlerNeedsUser('saveEvent'),
    config: {
      auth: auth.apiUser,
      description: 'Save an event',
      tags: ['api', 'events'],
      // Not everything is required as it can be drafted
      // unknown is used as the payload is dirty from the ctrl
      validate: {
        payload: {
          eventInfo: Joi.object({
            address: Joi.string(),
            city: joiValidator.place(),
            country: joiValidator.country(),
            position: Joi.object().optional().allow(null),
            dates: Joi.array().items(Joi.object({
              startTime: Joi.date().required(),
              endTime: Joi.date().required(),
            })).empty(),
            description: Joi.string().required(),
            dojoId: Joi.string().guid().required(),
            name: Joi.string().required(),
            public: Joi.boolean().required(),
            recurringType: Joi.string().valid('weekly').valid('biweekly').required(),
            type: Joi.string().valid('recurring').valid('one-off').required(),
            status: Joi.string()
              .valid('saved').valid('published').valid('cancelled')
              .required(),
            sessions: Joi.array().items(Joi.object()).empty().required(),
            ticketApproval: Joi.boolean().allow(null), // can be null due to copy
            useDojoAddress: Joi.boolean(),
            notifyOnApplicant: Joi.boolean(),
            userId: Joi.string().guid().optional(),
          }).unknown(),
        },
      },
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
      validate: {
        // Unknow used again due to dirty payload by angular scope
        payload: {
          applications: Joi.array().items(Joi.object({
            dojoId: Joi.string().guid().required(),
            parentEmailSubject: Joi.object({
              approved: Joi.string().valid('A ticket has been booked for your child for %1$s').valid('A ticket has been booked for your child for %1$s'),
              pending: Joi.string().valid('Your childs ticket request for %1$s is pending approval').valid('Your childs ticket status for %1$s has been changed to pending'),
              cancelled: Joi.string().valid('A ticket for your child for %1$s has been cancelled').optional(),
            }),
            emailSubject: Joi.object({
              received: Joi.string().valid('Your ticket request for %1$s has been received'),
              approved: Joi.string().valid('Your ticket for %1$s has been booked').valid('Your ticket request for %1$s has been approved'),
              pending: Joi.string().valid('Your ticket request for %1$s is pending approval').valid('Your ticket status for %1$s has been changed to pending'),
              cancelled: Joi.string().valid('Your ticket request for %1$s has been cancelled').optional(),
            }),
            dojoEmailSubject: Joi.object({
              approved: Joi.string().valid('A ticket has been booked for %1$s'),
              pending: Joi.string().valid('A ticket request has been made for %1$s'),
            }),
            eventId: Joi.string().guid().required(),
            sessionId: Joi.string().guid().required(),
            ticketName: Joi.string().required(),
            ticketType: Joi.string().required(),
            ticketId: Joi.string().guid().required(),
            userId: Joi.string().guid().required(),
            notes: Joi.string().optional().allow(null),
            // Update
            attendance: Joi.array(),
            created: Joi.date(),
            dateOfBirth: Joi.date(),
            deleted: Joi.boolean(),
            orderId: Joi.string().guid().allow(null),
            status: Joi.string()
              .valid('approved')
              .valid('pending')
              .valid('cancelled'),
            updateAction: Joi.string().optional()
              .valid('approve')
              .valid('disapprove')
              .valid('checkin')
              .valid('delete'),
          }).unknown()),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/update-application-attendance`,
    handler: handlers.actHandlerNeedsUser('updateApplicationAttendance'),
    config: {
      auth: auth.apiUser,
      description: 'Update attendance of an application',
      tags: ['api', 'events'],
      validate: {
        payload: {
          data: {
            applicationId: Joi.string().guid().required(),
            attended: Joi.boolean().required(),
            date: Joi.date().required(),
            dojoId: Joi.string().required(),
          },
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/session/cancel`,
    handler: handlers.actHandlerNeedsUser('cancelSession'),
    config: {
      auth: auth.apiUser,
      description: 'Cancel an event',
      tags: ['api', 'events'],
      validate: {
        payload: {
          session: Joi.object({
            id: Joi.string().required(),
            emailSubject: Joi.string().required().valid('Your ticket request for %1$s has been cancelled'),
          }).unknown(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/events/ticket/{ticketId}/invitations/user/{userId}`,
    handler: handlers.actHandlerNeedsUser('validateSessionInvitation', ['ticketId', 'userId']),
    config: {
      auth: auth.apiUser,
      description: 'Validate an invitation',
      tags: ['api', 'events'],
      validate: {
        payload: {
          invitation: {
            ticketId: Joi.string().guid().required(),
            userId: Joi.string().guid().required(),
            emailSubject: Joi.string()
              .valid('Your ticket request for %1$s has been received')
              .valid('Your ticket for %1$s has been booked')
              .valid('Your ticket request for %1$s is pending approval'),
          },
        },
        params: {
          ticketId: Joi.string().guid().required(),
          userId: Joi.string().guid().required(),
        },
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-events',
  dependencies: 'cd-auth',
};
