const _ = require('lodash');
const cacheTimes = require('../config/cache-times');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');
const joiValidator = require('./validations/dojos')();
const Boom = require('boom');
const Joi = require('joi');

function cleanUser(_user) {
  const user = _user;
  if (user) {
    delete user.pass;
    delete user.salt;
    delete user.active;
    delete user.accounts;
    delete user.confirmcode;
    delete user.profilePassword;
  }
  return user;
}

exports.register = function(server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0/users' }, eOptions);
  const handlers = handlerFactory(server, 'cd-users');


  function handleLogin() {
    return function (request, reply) {
      const args = {
        email: request.payload.email,
        password: request.payload.password,
      };
      const msg = _.defaults({ role: 'user', cmd: 'login' }, args);
      return request.seneca.act(msg, (err, res) => {
        if (err) return reply(err);
        if (res.ok) {
          res.login = cleanUser(res.login);
          request.cookieAuth.set({ token: res.login.token });
        }
        return reply(res);
      });
    };
  }

  function handleInstance(userType) {
    return function(request, reply) {
      if (!request.user) {
        return reply({ user: null, login: null, ok: true });
      }

      let user =
        (request.user.user && request.seneca.util.clean(request.user.user)) ||
        null;
      const login =
        (request.user.login && request.seneca.util.clean(request.user.login)) ||
        null;

      if (user) {
        user = cleanUser(user);
      }

      // Filter to limit the handleInstance to admin
      if (userType && user.roles.indexOf(userType) < 0) {
        return reply({ user: null, login: null, ok: false });
      }

      return request.seneca.act(
        { role: 'cd-profiles', cmd: 'load_user_profile', userId: user.id },
        (err, profile) => {
          if (err) return reply({ user: null, login: null, ok: false });

          if (!profile || !profile.userId) {
            return reply({ user: null, login: null, ok: false });
          }
          user.profileId = profile.id;
          return reply({ user, login, ok: true });
        }
      );
    };
  }

  function handleLogout(request, reply) {
    const session = request.state['seneca-login'];
    if (!session || (session && !session.token)) {
      return reply({ ok: true });
    }

    const msg = { role: 'user', cmd: 'logout', token: session.token };
    return request.seneca.act(msg, (err, resp) => {
      if (err) return reply(err);
      request.cookieAuth.clear();
      delete request.user;
      if (resp.user) {
        resp.user = cleanUser(resp.user);
      }
      return reply(resp);
    });
  }

  function handleRegister(request, reply) {
    const msg = _.defaults(
      { role: 'cd-users', cmd: 'register' },
      request.payload
    );
    return request.seneca.act(msg, (err, resp) => {
      if (err) return reply(Boom.badImplementation(err));
      if (resp.user) {
        resp.user = cleanUser(resp.user);
      }
      return reply(resp);
    });
  }

  /**
   * Handler to pre-verify the LMS webhook by comparing
   * the hash of the certificate as a string+pkey to the received hash
   * @param  {Object} request HapiJS request, data is raw (non-parsed)
   * @param  {Object} reply   Hapijs response
   */
  function actHandlerAwardBadge(request, reply) {
    //  NOTE : This is deactivated until LearnUpon fixes their checksum
    //  TODO : poll their closed source support to know if they fixed it
    // var certif = request.payload.toString();
    // console.log('certif', certif);
    // var rx = /,"signature":"(\w{32})"/g;
    // var signature = rx.exec(certif);
    // // we inverse the position of the comma in case it became the first item..
    // if (_.isEmpty(signature)) {
    //   rx = /"signature":"(\w{32})",/g;
    //   signature = rx.exec(certif);
    // }
    // var checksumCertif = certif.replace(rx, '');
    // // We check we caught the good regex group (md5length = 32)
    // if (signature[1] && signature[1].length === 32) {
    //   var checkValMsg = {role: 'cd-users', cmd: 'check_lms_certificate_authenticity',
    //   certif: checksumCertif, signature: signature[1]};
    //   request.seneca.act(checkValMsg, function (err, resp) {
    //     if (err) return reply(err).code(500);
    //     if (!resp.ok) return reply().code(403);

    const msg = _.defaults(
      { role: 'cd-users', cmd: 'award_lms_badge' },
      JSON.parse(request.payload)
    );
    request.seneca.act(msg, (err, resp) => {
      if (err || (resp && resp.ok === false))
        return reply(Boom.badImplementation(err || resp.why));
      reply(resp).code(200);
    });
    //   });
    // } else {
    //   // No signature found
    //   reply().code(500);
    // }
  }

  server.route([
    {
      method: 'POST',
      path: `${options.basePath}/login`,
      handler: handleLogin(),
      config: {
        description: 'Login',
        notes: 'Log passed user',
        tags: ['api'],
        validate: {
          payload: {
            email: Joi.string()
              .email()
              .required(),
            password: Joi.string().required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/cdf/login`,
      handler: handleLogin(),
      config: {
        description: 'Login',
        notes: 'Log passed user',
        tags: ['api'],
        validate: {
          payload: {
            email: Joi.string()
              .email()
              .required(),
            password: Joi.string().required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/logout`,
      handler: handleLogout,
      config: {
        description: 'Logout',
        notes: 'Logout',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {},
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/instance`,
      handler: handleInstance(),
      config: {
        // Should be apiUser, but this function is misused to check if loggedIn in f-end
        auth: auth.userIfPossible,
        description: 'Return an logged user',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/cdf/instance`,
      handler: handleInstance('cdf-admin'),
      config: {
        auth: auth.cdfAdmin,
        description: 'Return an logged cdf user',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/register`,
      handler: handleRegister,
      config: {
        description: 'Register an user',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: Joi.object({
            user: Joi.object({
              email: Joi.string()
                .email()
                .required(),
              emailSubject: Joi.string()
                .valid('Welcome to Zen, the CoderDojo community platform.')
                .required(),
              firstName: Joi.string().required(),
              lastName: Joi.string().required(),
              password: Joi.string().required(),
              'g-recaptcha-response': Joi.string().required(),
              initUserType: Joi.object({
                title: Joi.string()
                  .valid('Parent/Guardian')
                  .valid('Youth Over 13')
                  .required(),
                name: Joi.string()
                  .valid('parent-guardian')
                  .valid('attendee-o13')
                  .required(),
              }),
              termsConditionsAccepted: Joi.boolean()
                .valid(true)
                .required(),
              mailingList: Joi.boolean().optional(),
            }),
            profile: Joi.object({
              dob: Joi.date().required(),
              country: joiValidator.country().required(),
            }),
            recaptchaResponse: Joi.string(),
          }),
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/emails`,
      handler: handlers.actHandlerNeedsUser('get_users_by_emails'),
      config: {
        auth: auth.apiUser,
        description: 'Return users based upon emails',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            email: Joi.string(),
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/init-user-types`,
      handler: handlers.actHandler('get_init_user_types'),
      config: {
        cache: {
          expiresIn: cacheTimes.long,
        },
        description: 'Return the possible userTypes',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/reset-password`,
      handler: handlers.actHandler('reset_password'),
      config: {
        description: 'Reset user password',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            email: Joi.string()
              .email()
              .required(),
            emailSubject: Joi.string()
              .valid('CoderDojo Zen Password Reset Request')
              .required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/execute-reset`,
      handler: handlers.actHandler('execute_reset'),
      config: {
        description: 'Reset the password',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          payload: {
            token: Joi.string()
              .guid()
              .required(),
            password: Joi.string().required(),
            repeat: Joi.string().required(),
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/champions-for-user/{userId}`,
      handler: handlers.actHandlerNeedsUser(
        'load_champions_for_user',
        'userId'
      ),
      config: {
        auth: auth.apiUser,
        description: 'Load champions for a specified user',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/dojo-admins-for-user/{userId}`,
      handler: handlers.actHandlerNeedsUser(
        'load_dojo_admins_for_user',
        'userId'
      ),
      config: {
        auth: auth.apiUser,
        description: 'Load admins for a specified user',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            userId: Joi.string()
              .guid()
              .required(),
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/kpi/number-of-youths-registered`,
      handler: handlers.actHandlerNeedsUser('kpi_number_of_youths_registered'),
      config: {
        auth: auth.apiUser,
        description: 'Number of youth registered',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${
        options.basePath
      }/kpi/number-of-champions-and-mentors-registered`,
      handler: handlers.actHandlerNeedsUser(
        'kpi_number_of_champions_and_mentors_registered'
      ),
      config: {
        auth: auth.apiUser,
        description: 'Number of champions and mentors registered',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/kpi/number-of-youth-females-registered`,
      handler: handlers.actHandlerNeedsUser(
        'kpi_number_of_youth_females_registered'
      ),
      config: {
        auth: auth.apiUser,
        description: 'Number of female kids',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/load-previous-founder/{id}`,
      handler: handlers.actHandlerNeedsUser('load_prev_founder', 'id'),
      config: {
        auth: auth.apiUser,
        description: 'Load previous founder of a dojo',
        tags: ['api'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
        validate: {
          params: {
            id: Joi.string()
              .guid()
              .required(),
          },
        },
      },
    },
    {
      method: 'GET',
      path: `${options.basePath}/lms/user`,
      handler: handlers.actHandlerNeedsUser('get_lms_link', 'approval'),
      config: {
        auth: auth.apiUser,
        description: 'Get LMS connecting URL',
        tags: ['api', 'lms'],
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
    {
      method: 'POST',
      path: `${options.basePath}/lms/badge`,
      handler: actHandlerAwardBadge,
      config: {
        description: 'Webhook listener for LMS',
        tags: ['api', 'lms'],
        payload: {
          output: 'data',
          parse: false,
        },
        plugins: {
          'hapi-swagger': {
            responseMessages: [{ code: 200, message: 'OK' }],
          },
        },
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'api-cd-users-service',
  dependencies: 'cd-auth',
};
