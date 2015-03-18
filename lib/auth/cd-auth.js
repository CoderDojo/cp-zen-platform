'use strict';

var path = require('path');
var serve_static = require('serve-static');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-auth';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'auth',
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

  return {
    name: plugin
  };
};