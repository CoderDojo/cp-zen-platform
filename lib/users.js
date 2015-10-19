'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0/users' }, options);
  var handlers = require('./handlers.js')(server, 'cd-users');

  server.route([{
    method: 'POST',
    path: options.basePath + '/login',
    handler: handleLogin
  }, {
    method: 'POST',
    path: options.basePath + '/logout',
    handler: handleLogout
  }, {
    method: 'GET',
    path: options.basePath + '/instance',
    handler: handleInstance
  }, {
    method: 'POST',
    path: options.basePath + '/register',
    handler: handleRegister
  }, {
    method: 'PUT',
    path: options.basePath + '/promote/{id}',
    handler: handlers.actHandler('promote', 'id')
  }, {
    method: 'POST',
    path: options.basePath + '/emails',
    handler: handlers.actHandlerNeedsUser('get_users_by_emails')
  }, {
    method: 'POST',
    path: options.basePath + '/update/{id}',
    handler: handlers.actHandler('update', 'id')
  }, {
    method: 'GET',
    path: options.basePath + '/load/{id}',
    handler: handlers.actHandlerNeedsUser('load', 'id')
  }, {
    method: 'GET',
    path: options.basePath + '/init-user-types',
    handler: handlers.actHandler('get_init_user_types'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/is-champion',
    handler: handlers.actHandler('is_champion')
  }, {
    method: 'POST',
    path: options.basePath + '/reset-password',
    handler: handlers.actHandler('reset_password')
  }, {
    method: 'POST',
    path: options.basePath + '/execute-reset',
    handler: handlers.actHandler('execute_reset')
  }, {
    method: 'GET',
    path: options.basePath + '/champions-for-user/{userId}',
    handler: handlers.actHandler('load_champions_for_user', 'userId')
  }, {
    method: 'GET',
    path: options.basePath + '/dojo-admins-for-user/{userId}',
    handler: handlers.actHandler('load_dojo_admins_for_user', 'userId')
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-youths-registered',
    handler: handlers.actHandlerNeedsCdfAdmin('kpi_number_of_youths_registered')
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-champions-and-mentors-registered',
    handler: handlers.actHandlerNeedsCdfAdmin('kpi_number_of_champions_and_mentors_registered')
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-youth-females-registered',
    handler: handlers.actHandlerNeedsCdfAdmin('kpi_number_of_youth_females_registered')
  }
]);

  function handleLogin (request, reply) {
    var args = {email: request.payload.email, password: request.payload.password};
    var msg = _.extend({role: 'user', cmd: 'login'}, args);
    request.seneca.act(msg, function (err, out) {
      if (err) return reply(err);
      reply(out).state('seneca-login', out.login ? out.login.id : '');
    });
  }

  function handleInstance (request, reply) {
    if (!request.user) {
      return reply({user: null, login: null, ok: true});
    }

    var user = request.user.user && request.seneca.util.clean(request.user.user) || null;
    var login = request.user.login && request.seneca.util.clean(request.user.login) || null;

    if (user) {
      delete user.pass;
      delete user.salt;
      delete user.active;
      delete user.accounts;
      delete user.confirmcode;
    }

    reply({user: user, login: login, ok: true});
  }

  function handleLogout (request, reply) {
    var token = request.state['seneca-login'];
    if (!token) {
      return reply({ok: true});
    }

    var msg = {role: 'user', cmd: 'logout', token: token};
    request.seneca.act(msg, function (err, resp) {
      if (err) return reply(err);
      reply(resp).state('seneca-login', '', {ttl: 1});
    });
  }

  function handleRegister (request, reply) {
    var msg = _.extend({role: 'cd-users', cmd: 'register'}, request.payload);
    request.seneca.act(msg, function (err, resp) {
      if (err) return reply(err).code(500);
      if (resp.user) {
        delete resp.user.pass;
        delete resp.user.salt;
        delete resp.user.active;
        delete resp.user.accounts;
        delete resp.user.confirmcode;
      }
      reply(resp);
    });
  }

  next();
};

exports.register.attributes = {
  name: 'api-cd-users-service'
};
