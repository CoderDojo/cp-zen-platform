var _ = require('lodash');
var path = require('path');

var base = require('./options.base.js');

console.log("DOCKER", process.env.DOCKER_HOST);
var host = '192.168.59.103';

module.exports = _.defaults({

  'mongo-store': {
     name: 'cd-zen-platform-development',
     host: '127.0.0.1',
     port: 27017
  },
  'agreement-version' : 2,
  'postgresql-store': {
    name: 'cd-zen-platform-development',
    host: host,
    port: 5432,
    username: 'platform',
    password: 'QdYx3D5y'
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
        resetlinkprefix: 'http://127.0.0.1:8000/reset',
        confirmlinkprefix: 'http://127.0.0.1:8000/confirm'
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
    {type: 'web', host: '127.0.0.1', port: 10302, pin: 'role:cd-countries,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10302, pin: 'role:cd-geonames,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10303, pin: 'role:cd-users,cmd:*'},
    {type: 'web', host: '127.0.0.1', port: 10303, pin: 'role:cd-agreements,cmd:*'}
  ]

}, base);
