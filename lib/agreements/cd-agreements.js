'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'cd-agreements';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'save'}, proxy);
  seneca.add({role: plugin, cmd: 'get_agreements'}, proxy);
  seneca.add({role: plugin, cmd: 'count'}, proxy);

  function proxy(args, done) {
    seneca.act(seneca.util.argprops(
      {user:args.req$.seneca.login.user},
      args,
      {role: plugin}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'save': {POST: true, alias: 'agreements/:id?'},
      'get_agreements': {POST: true, alias: 'agreements/list-by-ids'},
      'count': {POST:true, alias: 'agreements/count'}
    }
  }});

  return {
    name: plugin
  }
}