const _ = require('lodash');
const cacheTimes = require('../config/cache-times');
const joiValidator = require('./validations/dojos')();
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const defaultImage = Buffer.from(fs.readFileSync(path.join(__dirname, '/../public/img/avatars/avatar.png'), 'base64'), 'base64');
const auth = require('../lib/authentications');
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-profiles');

  function handleAvatarImage(request, reply) {
    const user = request.user ? request.user.user : null;
    const msg = { role: 'cd-profiles', cmd: 'get_avatar', id: request.params.id, user };
    request.seneca.act(msg, (err, res) => {
      if (err || !res) {
        // send default profile pic
        return reply(defaultImage).header('Content-Type', 'image/png').header('Content-Length', defaultImage.length);
      }

      const buf = Buffer.from(res.imageData, 'base64');
      return reply(buf).header('Content-Type', 'image/png').header('Content-Length', buf.length);
    });
  }

  server.route([{
    method: 'POST',
    path: `${options.basePath}/profiles/user-profile-data`,
    handler: handlers.actHandlerNeedsUser('user_profile_data'),
    config: {
      auth: auth.apiUser,
      description: 'Get user data',
      tags: ['api', 'users'],
      validate: {
        payload: Joi.object({
          query: {
            userId: Joi.string().guid(),
          },
        }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/create`,
    handler: handlers.actHandlerNeedsUser('create'),
    config: {
      auth: auth.apiUser,
      description: 'Create/update a user profile',
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/youth/create`,
    handler: handlers.actHandlerNeedsUser('save-youth-profile'),
    config: {
      auth: auth.apiUser,
      description: 'Create a youth account',
      tags: ['api', 'users'],
      validate: {
        payload: {
          profile: {
            alias: Joi.string().required(),
            country: joiValidator.country(),
            city: Joi.object(),
            dob: Joi.date().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            gender: Joi.string().valid('Male').valid('Female').valid('Undisclosed')
              .allow(null)
              .optional(),
            placeGeonameId: Joi.string().allow(null),
            userTypes: Joi.array().items(Joi.string().valid('attendee-u13').valid('attendee-o13')),
          },
        },
      },
    },
  }, {
    method: 'PUT',
    path: `${options.basePath}/profiles/youth/update`,
    handler: handlers.actHandlerNeedsUser('update-youth-profile'),
    config: {
      auth: auth.apiUser,
      description: 'Update a youth profile',
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/invite-parent-guardian`,
    handler: handlers.actHandlerNeedsUser('invite-parent-guardian'),
    config: {
      auth: auth.apiUser,
      description: 'Invite a parent',
      tags: ['api', 'users'],
      validate: {
        payload: {
          data: Joi.object({
            childId: Joi.string().guid().required(),
            invitedParentEmail: Joi.string().email().required(),
            emailSubject: Joi.string().valid('You have been invited to register as a parent/guardian on Zen, the CoderDojo community platform.').required(),
          }),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/accept-parent-guardian`,
    handler: handlers.actHandlerNeedsUser('accept-parent-invite'),
    config: {
      auth: auth.apiUser,
      description: 'Accept to be a parent',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/hidden-fields`,
    handler: handlers.actHandler('load_hidden_fields'),
    config: {
      cache: {
        expiresIn: cacheTimes.long,
      },
      description: 'Get hidden fields',
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/change-avatar`,
    handler: handlers.actHandlerNeedsUser('change_avatar'),
    config: {
      auth: auth.apiUser,
      description: 'Change avatar',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/{id}/avatar`,
    handler: handlers.actHandler('get_avatar', 'id'),
    config: {
      description: 'Get avatar',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    /* Note: some older profiles in nodebb still using the 1.0 route */
    path: '/api/1.0/profiles/{id}/avatar_img',
    handler: handleAvatarImage,
    config: {
      auth: auth.userIfPossible,
      description: 'Nodebb avatar',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/{id}/avatar_img`,
    handler: handleAvatarImage,
    config: {
      auth: auth.userIfPossible,
      description: 'Get avatar image',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/parents-for-user/{userId}`,
    handler: handlers.actHandler('load_parents_for_user', 'userId'),
    config: {
      auth: auth.userIfPossible,
      description: 'Get parents for specified user',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/children-for-user/{userId}`,
    handler: handlers.actHandler('load_children_for_user', 'userId'),
    config: {
      auth: auth.userIfPossible,
      description: 'Get children for specified user',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/load-user-profile/{userId}`,
    handler: handlers.actHandlerNeedsUser('load_user_profile', 'userId', { isOwn: true }),
    config: {
      auth: auth.apiUser,
      description: 'Get user profile',
      tags: ['api', 'users'],
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/invite-ninja`,
    handler: handlers.actHandlerNeedsUser('invite_ninja'),
    config: {
      auth: auth.apiUser,
      description: 'Invite child',
      tags: ['api', 'users'],
      validate: {
        payload: {
          ninjaData: {
            ninjaEmail: Joi.string().email().required(),
            emailSubject: Joi.string().valid('You have been invited to connect with a parent/guardian on Zen!').required(),
          },
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/profiles/approve-invite-ninja`,
    handler: handlers.actHandlerNeedsUser('approve_invite_ninja'),
    config: {
      auth: auth.apiUser,
      description: 'Approve child invitation',
      tags: ['api', 'users'],
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/profiles/ninjas-for-user/{userId}`,
    handler: handlers.actHandlerNeedsUser('ninjas_for_user', 'userId'),
    config: {
      auth: auth.apiUser,
      description: 'Children for user',
      tags: ['api', 'users'],
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-profiles',
  dependencies: 'cd-auth',
};
