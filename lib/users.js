'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');
var Joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0/users' }, options);
  var handlers = require('./handlers.js')(server, 'cd-users');

  server.route([{
    method: 'POST',
    path: options.basePath + '/login',
    handler: handleLogin,
    config: {
      description: 'Login',
      notes: 'Log passed user',
      tags: ['api']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/logout',
    handler: handleLogout,
    config: {
      description: 'Logout',
      notes: 'Logout',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/instance',
    handler: handleInstance,
    config: {
      description: 'Return an logged user',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'POST',
    path: options.basePath + '/register',
    handler: handleRegister,
    config: {
      description: 'Register an user',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'PUT',
    path: options.basePath + '/promote/{id}',
    handler: handlers.actHandlerNeedsUser('promote', 'id'),
    config: {
      description: 'Promote an user',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'POST',
    path: options.basePath + '/emails',
    handler: handlers.actHandlerNeedsUser('get_users_by_emails'),
    config: {
      description: 'Return users based upon emails',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/init-user-types',
    handler: handlers.actHandler('get_init_user_types'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'Return the possible userTypes',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'POST',
    path: options.basePath + '/is-champion',
    handler: handlers.actHandlerNeedsUser('is_champion'),
    config: {
      description: 'Check if the user is a champion',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'POST',
    path: options.basePath + '/reset-password',
    handler: handlers.actHandler('reset_password'),
    config: {
      description: 'Reset user password',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'POST',
    path: options.basePath + '/execute-reset',
    handler: handlers.actHandler('execute_reset'),
    config: {
      description: 'Reset the password',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/champions-for-user/{userId}',
    handler: handlers.actHandlerNeedsUser('load_champions_for_user', 'userId'),
    config: {
      description: 'Load champions for a specified user',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/dojo-admins-for-user/{userId}',
    handler: handlers.actHandlerNeedsUser('load_dojo_admins_for_user', 'userId'),
    config: {
      description: 'Load admins for a specified user',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-youths-registered',
    handler: handlers.actHandlerNeedsUser('kpi_number_of_youths_registered'),
    config: {
      description: 'Number of youth registered',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-champions-and-mentors-registered',
    handler: handlers.actHandlerNeedsUser('kpi_number_of_champions_and_mentors_registered'),
    config: {
      description: 'Number of champions and mentors registered',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/kpi/number-of-youth-females-registered',
    handler: handlers.actHandlerNeedsUser('kpi_number_of_youth_females_registered'),
    config: {
      description: 'Number of female kids',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }, {
    method: 'GET',
    path: options.basePath + '/load-previous-founder/{id}',
    handler: handlers.actHandlerNeedsUser('load_prev_founder', 'id'),
    config: {
      description: 'Load previous founder of a dojo',
      tags: ['api'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK'}
          ]
        }
      },
    }
  }
]);

  function handleLogin (request, reply) {
    var args = {email: request.payload.email, password: request.payload.password};
    var msg = _.defaults({role: 'user', cmd: 'login'}, args);
    request.seneca.act(msg, function (err, out) {
      if (err) return reply(err);
      out.login = cleanUser(out.login);
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
      user = cleanUser(user);
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
    var msg = _.defaults({role: 'cd-users', cmd: 'register'}, request.payload);
    request.seneca.act(msg, function (err, resp) {
      if (err) return reply(err).code(500);
      if (resp.user) {
        resp.user = cleanUser(resp.user);
      }
      reply(resp);
    });
  }

  function cleanUser (user) {
    if (user) {
      delete user.pass;
      delete user.salt;
      delete user.active;
      delete user.accounts;
      delete user.confirmcode;
    }
    return user;
  }
  next();
};

exports.register.attributes = {
  name: 'api-cd-users-service'
};
