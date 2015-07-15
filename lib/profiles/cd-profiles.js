'use strict';

var _ = require('lodash');
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
  seneca.add({role: plugin, cmd: 'change_avatar'}, proxyFile);
  seneca.add({role: plugin, cmd: 'get_avatar'}, proxy);

  function proxyFile(args, done) {
    var user = {};
    var file = {};
    var fileInfo = {};
    if (args.req$.seneca.login) user = args.req$.seneca.login.user;
    if (args.req$.files) file = args.req$.files.file;

    var fileEncodeFinished;

    //this function calls service
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
    var locality = (args.req$.cookies['NG_TRANSLATE_LANG_KEY'] && args.req$.cookies['NG_TRANSLATE_LANG_KEY'].replace(/\"/g, '')) || args.req$.headers['accept-language'];

    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user, locality: locality},
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
      'change_avatar': {POST: true, alias: 'profiles/change-avatar'},
      'get_avatar': {GET: true, alias:'profiles/:id/avatar'}
    }
  }});

  return {
    name: plugin
  };

}
