'use strict';

var _ = require('lodash');


module.exports = function(options) {
  var seneca = this;
  var plugin = 'events';
  var version = '1.0';


  options = seneca.util.deepextend({
      prefix: '/api/'
  }, options);


  seneca.add({role: plugin, cmd: 'getEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'listEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'searchEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'applyForEvent'}, proxy);

  // Has validation
  seneca.add({role: plugin, cmd: 'createEvent'}, _.bind(proxy, null, _, _, true));
  seneca.add({role: plugin, cmd: 'updateEvent'}, _.bind(proxy, null, _, _, true));
  seneca.add({role: plugin, cmd: 'loadEventApplications'}, _.bind(proxy, null, _, _, true));
  seneca.add({role: plugin, cmd: 'updateApplication'}, _.bind(proxy, null, _, _, true));


  function proxy(args, done, validate) {
    var user = args.req$.seneca.user;
    var eventInfo = args.eventInfo;
    var eventId = args.eventId;

    if(!user) {
      return done(new Error('User must exist'));
    }

    if(!eventId && !eventInfo) {
      return done(new Error('EventId or eventInfo must exist'));
    }

    if(eventInfo) {
      var dojoId = eventInfo.dojoId;

      return checkUserPermissionsAndAct(user, dojoId, args, done);
    }

    // Get dojo id
    getEventById(eventId, function(err, event){
      if (err) {
        return done(err);
      }

      var dojoId = event.dojoId;

      checkUserPermissionsAndAct(user, dojoId, args, done);
    });
  }


  function checkUserPermissionsAndAct(user, dojoId, args, done) {
    checkUserPermissions(user.id, dojoId, function(err, hasPermission) {
      if (err) {
        return done(err);
      }

      seneca.act(seneca.util.argprops(
        {user:user},
        args,
        {role: 'cd-events'}
      ), done);
    });
  }


  function getEventById(eventId, done) {
    seneca.act({
      role: plugin,
      cmd: 'getEvent',
      id: eventId
    }, function(err, event) {
      if (err) {
        return done(err);
      }

      if(!event) {
        return done(new Error('Couldn\'t get event'));
      }

      return done(null, event);
    });
  }


  // Check that user is a member, champion and ticketing admin
  function checkUserPermissions(userId, dojoId, done) {
    var isChampion = false;
    var isTicketingAdmin = false;

    seneca.act({
      role: 'cd-dojos',
      cmd: 'load_usersdojos',
      query: {
        userId: userId,
        dojoId: dojoId
      }
    }, function(err, result) {
      if (err) {
        return done(err);
      }

      if (_.isEmpty(result)) {
        return done(new Error('No permission, user is not a member'));
      }

      var userDojoEntity = result[0];
      var userTypes = userDojoEntity.userTypes;
      var userPermissions = userDojoEntity.userPermissions;

      var isChampion = _.contains(userTypes, 'champion');

      if (!isChampion) {
        return done(new Error('No permission, user is not a champion'));
      }

      var isTicketingAdmin = _.find(userPermissions, function(userPermission) {
        return userPermission.name === 'ticketing-admin';
      });

      if (!isTicketingAdmin) {
        return done(new Error('No permission, user is not a ticketing admin'));
      }

      // Has permission
      return done(null, true);
    });
  }


  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'createEvent': { POST: true, alias: 'create-event' },
      'updateEvent': { POST: true, alias: 'update-event' },
      'getEvent': { GET: true, alias: 'events/:id' },
      'listEvents': { POST: true, alias: 'events'},
      'searchEvents': {POST: true, alias: 'events/search'},
      'applyForEvent': {GET: true, alias: 'events/:id/apply'},
      'loadEventApplications': {GET: true, alias: 'events/applications/:eventId'},
      'updateApplication': {PUT: true, alias: 'events/applications/:applicationId'}
    }
  }});


  return {
    name: plugin
  }
};
