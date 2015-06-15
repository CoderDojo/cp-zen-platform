'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'events';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'search'}, proxy);

  function proxy(args, done) {
    var user = {};
    if(args.req$) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: 'cd-events'}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix+version+'/events',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'list': {POST: true, alias: 'list'},
      'search': {POST: true, alias: 'search'}
    }
  }});

  return {
    name: plugin
  }

};