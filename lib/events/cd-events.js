'use strict';

module.exports = function(options) {
  var seneca = this;
  var plugin = 'cd-events';
  var version = '1.0';

  options = seneca.util.deepextend({
      prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'createEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'getEvent'}, proxy);
  seneca.add({role: plugin, cmd: 'listEvents'}, proxy);
  seneca.add({role: plugin, cmd: 'searchEvents'}, proxy);

  function proxy(args, done) {
    var user = null;
    if(args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: plugin}
    ), done);
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'createEvent': { POST: true, alias: 'create-event' },
      'getEvent': { GET: true, alias: 'events/:id' },
      'listEvents': { POST: true, alias: 'events'}
    }
  }});

  return {
    name: plugin
  }
};
