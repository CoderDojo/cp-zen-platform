'use strict';
var _ = require('lodash');

module.exports = function(options){
  var seneca = this;
  var plugin = 'oauth2-proxy';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'authorize'}, proxy);
  seneca.add({role: plugin, cmd: 'token'}, proxy);
  seneca.add({role: plugin, cmd: 'profile'}, proxy);

  function proxy(args, done) {
    var user = null;
    if(args.req$.seneca.user) user = args.req$.seneca.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role: 'cd-oauth2'}
    ), done);
  }

  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/oauth2',
    pin: {role: plugin,  cmd: '*'},
    map: {
      'authorize': {GET:true, alias: 'authorize'},
      'token': {POST:true, alias: 'token'},
      'profile': {GET:true, alias: 'profile'},
    }
  }});

  return {
    name: plugin
  }

};
