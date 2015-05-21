'use strict';

var _ = require('lodash');
_.mixin(require("lodash-deep"));
var path = require('path');
var serve_static = require('serve-static');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'dojos';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);

  seneca.add({role: plugin, cmd: 'search'}, proxy);
  seneca.add({role: plugin, cmd: 'load'}, proxy);
  seneca.add({role: plugin, cmd: 'find'}, proxy);
  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'create'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'update'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'delete'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'my_dojos'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'dojos_count'}, proxy);
  seneca.add({role: plugin, cmd: 'dojos_by_country'}, proxy);
  seneca.add({role: plugin, cmd: 'dojos_state_count'}, proxy);
  seneca.add({role: plugin, cmd: 'bulk_update'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'bulk_delete'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'get_stats'}, proxy);
  seneca.add({role: plugin, cmd: 'save_dojo_lead'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'load_user_dojo_lead'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'load_dojo_lead'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'load_setup_dojo_steps'}, proxyNeedUser);
  seneca.add({role: plugin, cmd: 'load_usersdojos'}, proxy);

  function proxy(args, done) {
    var user = null;
    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user},
      args,
      {role:'cd-dojos'}
    ), done);
  }

  function proxyNeedUser(args, done) {
    // TODO - how to set response code of 400 here??
    if(!_.deepHas(args.req$, 'seneca.login.user')) return done(new Error('Not logged in, please log in first.'));
    return proxy(args, done);
  }

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'dojos',
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
      'search': {POST: true, alias: 'dojos/search'},
      'create': {POST: true, alias: 'dojo_create'},
      'update': {PUT: true,  alias: 'dojos/:id'},
      'delete': {DELETE: true, alias: 'dojos/:id'},
      'list'  : {POST: true, alias: 'dojos'},
      'load'  : {GET: true, alias: 'dojos/:id'},
      'find'  : {POST: true, alias: 'dojos/find'},
      'my_dojos': {POST: true, alias: 'dojos/my_dojos'},
      'dojos_count': {GET: true, alias: 'dojos_count'},
      'dojos_by_country': {POST: true, alias:'dojos_by_country'},
      'dojos_state_count': {GET: true, alias: 'dojos_state_count/:country'},
      'bulk_update': {POST: true, alias: 'dojos/bulk_update'},
      'bulk_delete': {POST: true, alias: 'dojos/bulk_delete'},
      'get_stats': {POST: true, alias: 'dojos/stats'},
      'save_dojo_lead': {POST: true, alias: 'dojos/save_dojo_lead'},
      'load_user_dojo_lead': {GET: true, alias: 'dojos/user_dojo_lead/:id'},
      'load_dojo_lead': {GET: true, alias: 'dojos/dojo_lead/:id'},
      'load_setup_dojo_steps': {GET: true, alias: 'load_setup_dojo_steps'},
      'load_usersdojos': {POST: true, alias: 'dojos/users'}
    }
  }});

  return {
    name: plugin
  };

}