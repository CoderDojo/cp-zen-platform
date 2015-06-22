'use strict';

module.exports = function(options) {
  var seneca = this;
  var plugin = 'events';
  var version = '1.0';

  options = seneca.util.deepextend({
      prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'createEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'getEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'listEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'searchEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'applyForEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'loadEventApplications'}, proxy);
  seneca.add({role: plugin, cmd: 'updateApplication'}, proxy);
  seneca.add({role: plugin, cmd: 'searchApplications'}, proxy);
  seneca.add({role: plugin, cmd: 'bulkUpdateApplications'}, proxy);

  function proxy(args, done) {
    var user = null;
    if(args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: 'cd-events'}
    ), done);
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'createEvent': { POST: true, alias: 'create-event' },
      'getEvent': { GET: true, alias: 'events/:id' },
      'listEvents': { POST: true, alias: 'events'},
      'searchEvents': {POST: true, alias: 'events/search'},
      'applyForEvent': {GET: true, alias: 'events/:id/apply'},
      'loadEventApplications': {GET: true, alias: 'events/applications/:eventId'},
      'updateApplication': {PUT: true, alias: 'events/applications/:applicationId'},
      'searchApplications': {POST: true, alias: 'events/applications/search'},
      'bulkUpdateApplications': {POST: true, alias: 'events/applications/bulk_update'}
    }
  }});

  return {
    name: plugin
  }
};
