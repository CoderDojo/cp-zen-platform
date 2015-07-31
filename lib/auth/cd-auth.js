'use strict';

var path = require('path');

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

      var prefix = '/content/' + spec.name;

      var redirectArr = ['/', '/register', '/login'];

      seneca.act({ role: 'web', use: function (req, res, next) {
        if((redirectArr.indexOf(req.url) > -1) && req.user && req.user.login){
          res.redirect(302, '/dashboard/dojo-list');
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
