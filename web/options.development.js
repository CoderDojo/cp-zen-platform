var _ = require('lodash');
var path = require('path');

var base = require('./options.base.js');

module.exports = _.defaults({
  'agreement-version' : 2,
  auth: {
    restrict: function (req, res, next) {
      var profileUrl = '/dashboard/profile';
      if(_.contains(req.url, profileUrl) && !req.seneca.user) {
        var userId = req.url.split('/')[3];
        return res.redirect('/profile/' + userId);
      }
      if(_.contains(req.url, '/dashboard') && !_.contains(req.url, '/login') && !req.seneca.user) {
        //Not logged in, redirect to /login with referer parameter
        var referer = encodeURIComponent(req.url);
        return res.redirect('/login?referer=' + req.url);
      }
      return next();
    },
    sendemail: false,
    email: {
      code: {
        register: 'auth-register',
        create_reset: 'auth-create-reset'
      },
      subject: {
        register: 'Welcome to CoderDojo!',
        create_reset: 'CoderDojo Password Reset'
      },
      content: {
        resetlinkprefix: 'http://' + '127.0.0.1' + ':8000/reset',
        confirmlinkprefix: 'http://' + '127.0.0.1' + ':8000/confirm'
      }
    }
  },

  mail: {
    folder: path.resolve(__dirname + '/../email-templates'),
    mail: {
      from:'youremail@example.com'
    },
    config: {
      service: 'Gmail',
      auth: {
        user: 'youremail@example.com',
        pass: 'yourpass'
      }
    }
  },

  client: [
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10301, pin: 'role:cd-dojos,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10302, pin: 'role:cd-countries,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10302, pin: 'role:cd-geonames,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:cd-users,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:cd-agreements,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:cd-profiles,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:cd-oauth2,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10303, pin: 'role:user,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10305, pin: 'role:cd-badges,cmd:*'},
    {type: 'web', host: process.env.TARGETIP || '127.0.0.1', port: 10306, pin: 'role:cd-events,cmd:*'}
  ],

  redis: {
    "host": process.env.TARGETIP || (process.env.DOCKER_HOST ? require('url').parse(process.env.DOCKER_HOST).hostname : '127.0.0.1'),
    "port": 6379 // this isn't optioned
  }

}, base);
