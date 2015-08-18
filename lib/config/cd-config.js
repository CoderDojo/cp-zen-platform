'use strict';

var cacheTimes = require('../../web/config/cache-times');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-config';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'get'}, cmd_get);

  function cmd_get(args, done) {
    var key = args.key;
    var ret = {};
    if (!options[key]) {
      ret.error = 'Config key not found: ' + key;
      ret.http$ = {
        status: 404
      }
    } else {
      ret[key] = options[key];
    }
    done(null, ret);
  }

  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'get': {GET: true, alias: 'config/get'}
    }
  }});

  return {
    name: plugin
  };

};
