'use strict';

var _ = require('lodash');
var path = require('path');
var async = require('async');
var http = require('http');
var serve_static = require('serve-static');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'cd-countries';
  var version = '1.0';
  var ENTITY_NS = 'cd/countries';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'load_children'}, proxy);
  //seneca.add({role: plugin, cmd: 'create'}, proxy);
  //seneca.add({role: plugin, cmd: 'update'}, proxy);
  //seneca.add({role: plugin, cmd: 'delete'}, proxy);


  function proxy(args, done) {
    seneca.act(seneca.util.argprops(
      {user:args.req$.seneca.login.user},
      args,
      {role:'cd-countries'}
    ), done);
  }

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'countries',
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
      'list': {GET: true, alias: 'countries'},
      'load_children': {GET: true, alias: 'countries/:geonameId'}
    }
  }});

  return {
    name: plugin
  };

};