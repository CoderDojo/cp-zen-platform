'use strict';

var fs = require('fs');
var path= require('path');
var serve_static = require('serve-static');

module.exports = function(options) {
  var seneca = this;
  var plugin = 'profiles';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({ role: plugin, spec: 'web' }, spec_web);
  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'create'}, proxy);
  seneca.add({role: plugin, cmd: 'save-youth-profile'}, proxy);
  seneca.add({role: plugin, cmd: 'update-youth-profile'}, proxy);
  seneca.add({role: plugin, cmd: 'invite-parent-guardian'}, proxy);
  seneca.add({role: plugin, cmd: 'accept-invite'}, proxy);
  seneca.add({role: plugin, cmd: 'load_hidden_fields'}, proxy);
  seneca.add({role: plugin, cmd: 'change_avatar'}, proxyFile);

  function spec_web(args, done) {
    var public_folder = path.join(__dirname, 'public');

    done(null, {
      name: 'profiles',
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
        if(/(\/api\/.*\/profiles\/.*\/[\w]*\.(?:jpg|jpeg|gif|png))/.test(origurl)){
          console.log("load avatar from: "+ origurl);
        }
        /*if (0 === origurl.indexOf(prefix)) {
          req.url = origurl.substring(prefix.length);
          serve(req, res, function () {
            req.url = origurl;
            next();
          });
        }*/
        else {
          return next();
        }
      }});

      done();
    });
  });

  function proxyFile(args, done) {
    var user = {};
    var file = {};
    var fileInfo = {};
    if (args.req$.seneca.login) user = args.req$.seneca.login.user;
    if (args.req$.files) file = args.req$.files.file;

    var fileEncodeFinished;

    //thi function calls service
    function savePhoto() {
      if(fileEncodeFinished) {
        seneca.act(seneca.util.argprops(
          {user: user, file: fileInfo, profileId: args.profileId},
          args,
          {role: 'cd-profiles'}
        ), done);
      }
    }

    //transform file to base64
    fs.readFile(file.path, function(err, data) {
      fileInfo.base64 = new Buffer(data).toString('base64');
      fileInfo.name = file.name;
      fileInfo.type = file.type;

      fileEncodeFinished = true;
      savePhoto();
    });
  }

  function proxy(args, done) {
    var user = {};
    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user: user},
      args,
      {role: 'cd-profiles'}
    ), done);
  }
  
  // web interface
  seneca.act({ role: 'web', use: {
    prefix: options.prefix + version + '/',
    pin: { role: plugin, cmd: '*' },
    map : {
      'list' : {POST: true, alias: 'profiles'},
      'create' : {POST: true, alias: 'profiles/create'},
      'save-youth-profile': {POST: true, alias: 'profiles/youth/create'},
      'update-youth-profile': {PUT: true, alias: 'profiles/youth/update'},
      'invite-parent-guardian': {POST: true, alias: 'profiles/invite-parent-guardian'},
      'accept-invite': {POST: true, alias: 'profiles/accept-parent-guardian'},
      'load_hidden_fields': {GET: true, alias: 'profiles/hidden-fields'},
      'change_avatar': {POST: true, alias: 'profiles/change-avatar'}
    }
  }});

  return {
    name: plugin
  };

}
