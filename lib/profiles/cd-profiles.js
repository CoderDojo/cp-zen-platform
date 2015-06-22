'use strict';

module.exports = function(options) {
  var seneca = this;
  var plugin = 'profiles';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'create'}, proxy);
  seneca.add({role: plugin, cmd: 'save-youth-profile'}, proxy);
  seneca.add({role: plugin, cmd: 'update-youth-profile'}, proxy);

  function proxy(args, done) {
    var user = {};
    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: 'cd-profiles'}
    ), done);
  }
  
  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map : {
      'list' : {POST: true, alias: 'profiles'},
      'create' : {POST: true, alias: 'profiles/create'},
      'save-youth-profile': {POST: true, alias: 'profiles/youth/create'},
      'update-youth-profile': {PUT: true, alias: 'profiles/youth/update'}
    }
  }});

  return {
    name: plugin
  };

}