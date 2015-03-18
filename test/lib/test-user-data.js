'use strict';

var _ = require('lodash');
var async = require('async');

module.exports = function (options) {
  var seneca = this;
  var plugin = 'test-user-data';
  var users = [
    { nick: 'admin@example.com', name: 'Admin', email: 'admin@example.com', password: 'test', roles: ['admin'] },
    { nick: 'manager@example.com', name: 'Manager', email: 'manager@example.com', password: 'test', roles: ['manager'] }
  ];

  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {
    var userpin = seneca.pin({ role: 'user', cmd: '*' });

    var registerusers = function (done) {
      async.eachSeries(users, userpin.register, done);
    };

    async.series([
      registerusers
    ], done);

  });

  seneca.add({ role: plugin, cmd: 'clean' }, function (args, done) {
    var userpin = seneca.pin({ role: 'user', cmd: '*' });

    var deleteusers = function (done) {
      async.eachSeries(users, userpin.delete, done);
    };

    async.series([
      deleteusers
    ], done);
  });

  return {
    name: plugin
  };
};

