var _ = require('lodash');
var path = require('path');

var base = require('./options.base.js');

// Utility function for local development running with boot2docker
// where we need the ip address of boot2docker instead of localhost.
// This is for accessing containerised services.
function localhost() {
  if (process.env.DOCKER_HOST) {
    return require('url').parse(process.env.DOCKER_HOST).hostname;
  }
  if (process.env.TARGETIP) {
    return process.env.TARGETIP;
  } 
  return '127.0.0.1';
}


module.exports = _.defaults({
  'agreement-version' : 2,
  'postgresql-store': {
    name: process.env.POSTGRES_NAME,
    host: process.env.POSTGRES_HOST || localhost(),
    port: process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD
  },
  auth: {
    restrict: ['/dashboard'],
    redirect:{
      restrict: '/'
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
    {type: 'web', host: '127.0.0.1', port: 10301, pin: 'role:cd-dojos,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10301, pin: 'role:cd-profiles,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10302, pin: 'role:cd-countries,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10302, pin: 'role:cd-geonames,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10303, pin: 'role:cd-users,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10303, pin: 'role:cd-agreements,cmd:*'}
  ]

}, base);
