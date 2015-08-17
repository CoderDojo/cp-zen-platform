'use strict';

module.exports = function(options){
  var seneca = this;
  var plugin = 'agreements';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'save'}, proxyWithIP);
  seneca.add({role: plugin, cmd: 'get_agreements'}, proxy);
  seneca.add({role: plugin, cmd: 'count'}, proxy);
  seneca.add({role: plugin, cmd: 'load_user_agreement'}, proxy);

  function proxy(args, done) {
    seneca.act(seneca.util.argprops(
      {user:args.req$.seneca.login.user},
      args,
      {role: 'cd-agreements'}
    ), done);
  }

  function proxyWithIP(args, done) {
    var ip = args.req$.headers['x-forwarded-for'] || args.req$.connection.remoteAddress;

    if(args.agreement){
      args.agreement.ipAddress = ip;
    }

    return proxy(args, done); 
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'save': {POST: true, alias: 'agreements'},
      'get_agreements': {POST: true, alias: 'agreements/list-by-ids'},
      'count': {POST:true, alias: 'agreements/count'},
      'load_user_agreement': {GET:true, alias: 'agreements/:id'}
    }
  }});

  return {
    name: plugin
  }
}
