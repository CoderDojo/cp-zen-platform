'use strict';

var _ = require('lodash');
var joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-events');

  server.route([{
    method: 'POST',
    path: options.basePath + '/events/save',
    handler: validateEvent('saveEvent')
  }, {
    method: 'GET',
    path: options.basePath + '/events/{id}',
    handler: handlers.actHandler('getEvent', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/events',
    handler: handlers.actHandler('listEvents')
  }, {
    method: 'POST',
    path: options.basePath + '/events/search',
    handler: handlers.actHandler('searchEvents')
  }, {
    method: 'GET',
    path: options.basePath + '/events/applications/{eventId}',
    handler: validateEvent('loadEventApplications')
  }, {
    method: 'POST',
    path: options.basePath + '/events/applications/search',
    handler: handlers.actHandler('searchApplications')
  }, {
    method: 'DELETE',
    path: options.basePath + '/events/{eventId}/applications/{applicationId}',
    handler: deleteApplicationHandler
  }, {
    method: 'POST',
    path: options.basePath + '/events/application',
    handler: saveApplicationHandler
  }, {
    method: 'POST',
    path: options.basePath + '/events/user-dojos-events',
    handler: handlers.actHandlerNeedsUser('userDojosEvents')
  }, {
    method: 'GET',
    path: options.basePath + '/events/tickets/types',
    handler: handlers.actHandler('ticketTypes')
  }, {
    method: 'GET',
    path: options.basePath + '/events/export-guest-list/dojo/{dojoId}/event/{eventId}/{status}',
    handler: exportGuestListHandlerNeedsDojoAdmin
  }, {
    method: 'POST',
    path: options.basePath + '/events/sessions/search',
    handler: handlers.actHandler('searchSessions')
  }, {
    method: 'POST',
    path: options.basePath + '/events/bulk-apply-applications',
    handler: handlers.actHandler('bulkApplyApplications')
  }, {
    method: 'POST',
    path: options.basePath + '/events/update-application-attendance',
    handler: handlers.actHandler('updateApplicationAttendance')
  }, {
    method: 'POST',
    path: options.basePath + '/events/session/cancel',
    handler: handlers.actHandler('cancelSession')
  }, {
    method: 'POST',
    path: options.basePath + '/events/session/validate-invitation',
    handler: handlers.actHandler('validateSessionInvitation')
  }]);

  function exportGuestListHandlerNeedsDojoAdmin (request, reply) {
    var user = request.user;
    if (!user) return reply('Not logged in').code(401);

    var zenHostname = request && request.headers.host || '127.0.0.1:8000';
    var msg = {
      cmd: 'user_is_dojo_admin',
      role: 'cd-dojos',
      zenHostname: zenHostname,
      locality: server.methods.locality(request)
    };

    if (request.payload) {
      msg = _.extend(msg, request.payload);
    }
    if (request.query) {
      msg = _.extend(msg, request.query);
    }

    if (request.params) {
      msg = _.extend(msg, request.params);
    }

    if (user) {
      msg = _.extend(msg, user);
    } else if (request.user) {
      msg = _.extend(msg, request.user);
    }

    request.seneca.act(msg, function (err, resp) {
      if (err) return reply(err).code(500);

      var code = 200;
      if (!resp.userIsDojoAdmin) {
        code = 401;
        return reply({ok: false, why: 'You must be a dojo admin or ticketing admin to access this data'}).code(code);
      }

      var eventId = request.params.eventId;
      var status = request.params.status;
      request.seneca.act({role: 'cd-events', cmd: 'exportGuestList', eventId: eventId, status: status}, function (err, obj) {
        if (err) return reply('Fatal error: ' + err).code(500);
        reply(obj.data).header('Content-Type', 'application/csv').header('Content-Disposition', 'attachment; filename=event-'+status+'-list.csv');
      });
    });
  }

  function validateEvent (cmd) {
    return function (request, reply) {
      var user = request.user;
      var eventInfo = request.payload.eventInfo;
      var eventId = request.payload.eventId;

      if (!user) {
        return reply({ok: false, why: 'User must exist'});
      }

      if (!eventId && !eventInfo) {
        return reply({ok: false, why: 'EventId or eventInfo must exist'});
      }

      if (eventInfo) {
        var dojoId = eventInfo.dojoId;
        return checkUserPermissionsAndAct(user, dojoId, cmd, request, reply);
      }

      // Get dojo id
      getEventById(request, eventId, function (err, event) {
        if (err) return reply('Error getting event: ' + eventId + ' - ' + err).code(500);
        checkUserPermissionsAndAct(user, event.dojoId, cmd, request, reply);
      });
    }
  }

  function saveApplicationHandler (request, reply) {
    var user = request.user;
    var application = request.payload.application;

    if (!application) return reply({ok: false, why: 'Application must exist'});

    var eventId = application.eventId;
    getEventById(request, eventId, function (err, event) {
      if (err) return reply('Error getting event: ' + eventId + ' - ' + err).code(500);
      checkUserPermissionsAndAct(user, event.dojoId, 'saveApplication', request, reply);
    });
  }

  function deleteApplicationHandler (request, reply) {

    var user = request.user;
    var applicationId = request.params.applicationId;
    var eventId = request.params.eventId;

    if (!applicationId || !eventId) return reply({ok: false, why: 'Application Id or Event Id missing'});

    getEventById(request, eventId, function (err, event) {
      if (err) return reply('Error getting event: ' + eventId + ' - ' + err).code(500);
      checkUserPermissionsAndAct(user, event.dojoId, 'deleteApplication', request, reply);
    });
  }

  function checkUserPermissionsAndAct (user, dojoId, cmd, request, reply) {
    checkUserPermissions(request, user.id, dojoId, function (err, hasPermission) {
      if (err)  return reply(err).code(500);
      handlers.doAct(request, reply, cmd, ['eventId', 'eventInfo', 'applicationId'], user);
    });
  }

  function getEventById (request, eventId, done) {
    request.seneca.act({
      role: 'cd-events',
      cmd: 'getEvent',
      id: eventId
    }, function (err, event) {
      if (err) {
        return done(err);
      }

      if (!event) {
        return done(new Error('Couldn\'t get event'));
      }

      return done(null, event);
    });
  }

  // Check that user is a member, champion and ticketing admin
  function checkUserPermissions (request, userId, dojoId, done) {
    request.seneca.act({
      role: 'cd-dojos',
      cmd: 'load_usersdojos',
      query: {
        userId: userId,
        dojoId: dojoId
      }
    }, function (err, result) {
      if (err) {
        return done(err);
      }

      if (_.isEmpty(result)) {
        return done(null, {ok: false, why: 'No permission, user is not a member'});
      }

      var userDojoEntity = result[0];
      var userPermissions = userDojoEntity.userPermissions;
      var isTicketingAdmin = _.find(userPermissions, function (userPermission) {
        return userPermission.name === 'ticketing-admin';
      });

      if (!isTicketingAdmin) {
        return done(null, {ok: false, why: 'No permission, user is not a ticketing admin'});
      }

      // Has permission
      return done(null, true);
    });
  }



  next();
};

exports.register.attributes = {
  name: 'api-events'
};
