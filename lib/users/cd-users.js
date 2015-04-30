'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'cd-users';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'register'}, proxy);
  seneca.add({role: plugin, cmd: 'promote'}, proxy);

  function proxy(args, done) {
    var user = {};
    if(args.req$) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: plugin}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix+version+'/users',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'list': {POST: true, alias: 'list'},
      'register': {POST: true, alias: 'register'},
      'promote': {PUT: true, alias: 'promote/:id'}
    }
  }});

  return {
    name: plugin
  }

};