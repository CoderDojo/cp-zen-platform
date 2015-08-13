'use strict';


module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-sys';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'ping'}, cmd_ping);

  function cmd_ping(args, done) {
    done(null, {status: 'ok'});
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'ping': {GET: true, alias: 'sys/ping'}
    }
  }});

  return {
    name: plugin
  };

};
