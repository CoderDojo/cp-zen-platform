'use strict';

var _ = require('lodash');
var fs = require('fs');
var cacheTimes = require('../../web/config/cache-times');

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
  seneca.add({role: plugin, cmd: 'accept_parent_invite'}, proxy);
  seneca.add({role: plugin, cmd: 'load_hidden_fields'}, proxy);
  seneca.add({role: plugin, cmd: 'change_avatar'}, proxyFile);
  seneca.add({role: plugin, cmd: 'get_avatar'}, proxy);
  seneca.add({role: plugin, cmd: 'get_avatar_img'}, imgProxy);
  seneca.add({role: plugin, cmd: 'load_parents_for_user'}, proxy);
  seneca.add({role: plugin, cmd: 'invite_ninja'}, proxy);
  seneca.add({role: plugin, cmd: 'approve_invite_ninja'}, proxy);

  function imgProxy(args, done) {
    args.cmd = 'get_avatar'
    var user = {};
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
   if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user, zenHostname: zenHostname},
      args,
      {role: 'cd-profiles'}
    ), function(err, res){
      var buf = new Buffer(res.imageData, 'base64');
      args.res$.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': buf.length
      }); 
      args.res$.end(buf);
      setTimeout(done, 100);
    });
  }

  function proxyFile(args, done) {
    var user = {};
    if (args.req$.seneca.login) user = args.req$.seneca.login.user;

    var fileEncodeFinished;

    //this function calls service
    function savePhoto() {
      if(fileEncodeFinished) {
        seneca.act(seneca.util.argprops(
          {user: user, profileId: args.profileId, fatal$: false},
          args,
          {role: 'cd-profiles'}
        ), done);
      }
    }

    fileEncodeFinished = true;
    savePhoto();
  }

  function proxy(args, done) {
    var user = {};
    var zenHostname = args.req$.headers.host || '127.0.0.1:8000';
    var locality = (args.req$.cookies.NG_TRANSLATE_LANG_KEY && args.req$.cookies.NG_TRANSLATE_LANG_KEY.replace(/\"/g, '')) || args.req$.headers['accept-language'];
    locality = formatLocaleCode(locality);
    if(args.req$.seneca.login) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user:user, zenHostname: zenHostname, locality: locality},
      args,
      {role: 'cd-profiles'}
    ), done);
  }

  function formatLocaleCode(code) {
    return code.slice(0, 3) + code.charAt(3).toUpperCase() + code.charAt(4).toUpperCase();
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
      'accept_parent_invite': {POST: true, alias: 'profiles/accept-parent-guardian'},
      'load_hidden_fields': {GET: true, alias: 'profiles/hidden-fields', expiresIn: cacheTimes.long},
      'change_avatar': {POST: true, alias: 'profiles/change-avatar'},
      'get_avatar': {GET: true, alias:'profiles/:id/avatar', privacy: 'private'},
      'get_avatar_img': {GET: true, alias:'profiles/:id/avatar_img', privacy: 'private'},
      'load_parents_for_user': {GET: true, alias: 'profiles/parents_for_user/:userId'},
      'invite_ninja': {POST:true, alias: 'profiles/invite_ninja'},
      'approve_invite_ninja': {POST: true, alias: 'profiles/approve_invite_ninja'}
    }
  }});

  return {
    name: plugin
  };

}
