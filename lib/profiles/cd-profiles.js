'use strict';

var Busboy = require('busboy');
var fs = require('fs');

module.exports = function(options) {
  var seneca = this;
  var plugin = 'profiles';
  var version = '1.0';

  options = seneca.util.deepextend({
    prefix: '/api/'
  }, options);

  seneca.add({role: plugin, cmd: 'list'}, proxy);
  seneca.add({role: plugin, cmd: 'create'}, proxy);
  seneca.add({role: plugin, cmd: 'save-youth-profile'}, proxy);
  seneca.add({role: plugin, cmd: 'update-youth-profile'}, proxy);
  seneca.add({role: plugin, cmd: 'invite-parent-guardian'}, proxy);
  seneca.add({role: plugin, cmd: 'accept-invite'}, proxy);
  seneca.add({role: plugin, cmd: 'load_hidden_fields'}, proxy);
  seneca.add({role: plugin, cmd: 'change_avatar'}, proxyBusboy);

  function proxyBusboy(args, done) {
    var req = args.req$;

    var user = {};
    var fileInfo = {};
    if (args.req$.seneca.login) user = args.req$.seneca.login.user;


    var busboyFinished;
    var fileEncodeFinished;
    var busboy = new Busboy({ headers: req.headers });
    req.pipe(busboy);

    //thi function calls service
    function savePhoto() {
      if(busboyFinished && fileEncodeFinished) {
        seneca.act(seneca.util.argprops(
          {user: user, file: fileInfo},
          args,
          {role: 'cd-profiles'}
        ), done);
      }
    }

    // parsing files attached to the form
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      if (filename !== '') {
        fileInfo.filename = filename;
      }

      //transform file to base64
      fs.readFile(file, function(err, data) {
        fileInfo.base64 = new Buffer(data).toString('base64');
        fileEncodeFinished = true;
        savePhoto();
      });
    });


    //send parsed info once busboy has finished
    busboy.on('finish', function () {
      busboyFinished = true;
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
      'change_avatar': {POST: true, alias: 'profiles/change_avatar'}
    }
  }});

  return {
    name: plugin
  };

}
