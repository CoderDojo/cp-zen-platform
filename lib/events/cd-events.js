'use strict';

var _ = require('lodash');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'events';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'getEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'listEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'searchEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'searchApplications'}, proxy);
  seneca.add({role: plugin, cmd: 'userDojosEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'ticketTypes'}, proxy);
  seneca.add({role: plugin, cmd: 'exportGuestList'}, proxy);
  seneca.add({role: plugin, cmd: 'searchSessions'}, proxy);
  seneca.add({role: plugin, cmd: 'bulkApplyApplications'}, proxy);
  seneca.add({role: plugin, cmd: 'updateApplicationAttendance'}, proxy);
  seneca.add({role: plugin, cmd: 'cancelSession'}, proxy);
  seneca.add({role: plugin, cmd: 'validateSessionInvitation'}, proxy);

  // Has validation
  seneca.add({role: plugin, cmd: 'saveEvent'}, eventValidationProxy);
  seneca.add({role: plugin, cmd: 'loadEventApplications'}, eventValidationProxy);
  seneca.add({role: plugin, cmd: 'deleteApplication'}, deleteApplicationValidationProxy);
  seneca.add({role: plugin, cmd: 'saveApplication'}, applicationValidationProxy);

  function proxy (args, done) {
    var user = null;
    var locality = (args.req$ && args.req$.cookies.NG_TRANSLATE_LANG_KEY && args.req$.cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, '')) || args.req$ && args.req$.headers['accept-language'];
    if (!locality) locality = 'en_US';
    locality = formatLocaleCode(locality);
    var zenHostname = args.req$ && args.req$.headers.host || '127.0.0.1:8000';
    if (args.req$) user = args.req$.seneca.user;
    sendToEventsService(user, args, locality, zenHostname, done);
  }

  function eventValidationProxy (args, done) {
    var user = args.req$.seneca.user;
    var eventInfo = args.eventInfo;
    var eventId = args.eventId;

    if (!user) {
      return done(null, {ok: false, why: 'User must exist'});
    }

    if (!eventId && !eventInfo) {
      return done(null, {ok: false, why: 'EventId or eventInfo must exist'});
    }

    if (eventInfo) {
      var dojoId = eventInfo.dojoId;

      return checkUserPermissionsAndAct(user, dojoId, args, done);
    }

    // Get dojo id
    getEventById(eventId, function (err, event) {
      if (err) {
        return done(err);
      }

      var dojoId = event.dojoId;

      checkUserPermissionsAndAct(user, dojoId, args, done);
    });
  }

  function applicationValidationProxy (args, done) {
    var user = args.req$.seneca.user;
    var application = args.application;

    if (!application) return done(null, {ok: false, why: 'Application must exist'});

    var eventId = application.eventId;
    getEventById(eventId, function (err, event) {
      if (err) return done(err);
      var dojoId = event.dojoId;
      checkUserPermissionsAndAct(user, dojoId, args, done);
    });
  }

  function deleteApplicationValidationProxy (args, done) {
    var user = args.req$.seneca.user;
    var applicationId = args.applicationId;
    var eventId = args.eventId;

    if (!applicationId || !eventId) return done(null, {ok: false, why: 'Application ID or Event ID missing'});

    getEventById(eventId, function (err, event) {
      if (err) return done(err);
      var dojoId = event.dojoId;
      checkUserPermissionsAndAct(user, dojoId, args, done);
    });
  }

  function checkUserPermissionsAndAct (user, dojoId, args, done) {
    checkUserPermissions(user.id, dojoId, function (err, hasPermission) {
      if (err) {
        return done(err);
      }
      return proxy(args, done);
    });
  }

  function sendToEventsService (user, args, locality, zenHostname, done) {
    seneca.act(seneca.util.argprops(
      {user: user, locality: locality, zenHostname: zenHostname, fatal$: false},
      args,
      {role: 'cd-events'}
    ), done);
  }

  function getEventById (eventId, done) {
    seneca.act({
      role: plugin,
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
  function checkUserPermissions (userId, dojoId, done) {
    seneca.act({
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

  function formatLocaleCode (code) {
    return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'saveEvent': {POST: true, alias: 'save-event'},
      'getEvent': {GET: true, alias: 'events/:id'},
      'listEvents': {POST: true, alias: 'events'},
      'searchEvents': {POST: true, alias: 'events/search'},
      'loadEventApplications': {GET: true, alias: 'events/applications/:eventId'},
      'searchApplications': {POST: true, alias: 'events/applications/search'},
      'deleteApplication': {DELETE: true, alias: 'events/applications/:eventId/:applicationId'},
      'saveApplication': {POST: true, alias: 'events/applications'},
      'userDojosEvents': {POST: true, alias: 'events/user-dojos-events'},
      'ticketTypes': {GET: true, alias: 'events/tickets/types'},
      'exportGuestList': {
        GET: {
          handler: function (req, res, args, act, respond) {
            seneca.act({role: plugin, cmd: 'exportGuestList', eventId: args.eventId}, respond);
          },
          responder: function (req, res, err, obj) {
            res.setHeader('Content-Type', 'application/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=event-guest-list.csv');
            res.setHeader('x-download-options');
            res.setHeader('x-content-type-options');
            res.write(obj.data);
            res.end();
          }
        },
        alias: 'events/export-guest-list/:eventId'
      },
      'searchSessions': {POST: true, alias: 'events/search_sessions'},
      'bulkApplyApplications': {POST: true, alias: 'events/bulk_apply_applications'},
      'updateApplicationAttendance': {POST: true, alias: 'events/update_application_attendance'},
      'cancelSession': {POST: true, alias: 'events/cancel_session'},
      'validateSessionInvitation': {POST: true, alias: 'events/validate_session_invitation'}
    }
  }});

  return {
    name: plugin
  };
};
