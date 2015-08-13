'use strict';

var path = require('path');
var serve_static = require('serve-static');
var cacheTimes = require('../../web/config/cache-times');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-charter';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);
  seneca.add({ role: plugin, cmd: 'load' }, cmd_load);

  function cmd_load(args, done) {
    var charterText = 'Hello World Foundation charter for CoderDojo'
    done(null, charterText)
  }

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'charter',
      public: public_folder
    });
  }

  seneca.add({ init: plugin }, function (args, done) {
    var seneca = this;

    seneca.act({ role: plugin, spec: 'web' }, function (err, spec) {
      if (err) { return done(err); }

      var serve = serve_static(spec.public);
      var prefix = '/content/' + spec.name;

      seneca.act({ role: 'web', use: function (req, res, next) {
        var origurl = req.url;
        if (0 === origurl.indexOf(prefix)) {
          req.url = origurl.substring(prefix.length);
          serve(req, res, function () {
            req.url = origurl;
            next();
          });
        }
        else {
          return next();
        }
      }});

      done();
    });
  });

   // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map: {
      'load': {GET: true, alias: 'charter', expiresIn: cacheTimes.long}
    }
  }});

  return {
    name: plugin
  };
};
