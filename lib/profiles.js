'use strict';

var _ = require('lodash');
var cacheTimes = require('../web/config/cache-times');
var fs = require('fs');
var defaultImage = new Buffer(fs.readFileSync(__dirname + '/../web/public/img/avatars/avatar.png', 'base64'), 'base64');
var auth = require('./authentications');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-profiles');

  server.route([{
    method: 'POST',
    path: options.basePath + '/profiles/user-profile-data',
    handler: handlers.actHandlerNeedsUser('user_profile_data'),
    config: {
      auth: auth.apiUser,
      description: 'Get user data',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/create',
    handler: handlers.actHandlerNeedsUser('create'),
    config: {
      auth: auth.apiUser,
      description: 'Create/update a user profile',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/youth/create',
    handler: handlers.actHandlerNeedsUser('save-youth-profile'),
    config: {
      auth: auth.apiUser,
      description: 'Create a youth account',
      tags: ['api', 'users']
    }
  }, {
    method: 'PUT',
    path: options.basePath + '/profiles/youth/update',
    handler: handlers.actHandlerNeedsUser('update-youth-profile'),
    config: {
      auth: auth.apiUser,
      description: 'Update a youth profile',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/invite-parent-guardian',
    handler: handlers.actHandlerNeedsUser('invite-parent-guardian'),
    config: {
      auth: auth.apiUser,
      description: 'Invite a parent',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/accept-parent-guardian',
    handler: handlers.actHandlerNeedsUser('accept-parent-invite'),
    config: {
      auth: auth.apiUser,
      description: 'Accept to be a parent',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/hidden-fields',
    handler: handlers.actHandler('load_hidden_fields'),
    config: {
      cache: {
        expiresIn: cacheTimes.long
      },
      description: 'Get hidden fields',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/change-avatar',
    handler: handlers.actHandlerNeedsUser('change_avatar'),
    config: {
      auth: auth.apiUser,
      description: 'Change avatar',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/{id}/avatar',
    handler: handlers.actHandler('get_avatar', 'id'),
    config: {
      description: 'Get avatar',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    /* Note: some older profiles in nodebb still using the 1.0 route*/
    path: '/api/1.0/profiles/{id}/avatar_img',
    handler: handleAvatarImage,
    config: {
      auth: auth.userIfPossible,
      description: 'Nodebb avatar',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/{id}/avatar_img',
    handler: handleAvatarImage,
    config: {
      auth: auth.userIfPossible,
      description: 'Get avatar image',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/parents-for-user/{userId}',
    handler: handlers.actHandler('load_parents_for_user', 'userId'),
    config: {
      auth: auth.userIfPossible,
      description: 'Get parents for specified user',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/children-for-user/{userId}',
    handler: handlers.actHandler('load_children_for_user', 'userId'),
    config: {
      auth: auth.userIfPossible,
      description: 'Get children for specified user',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/load-user-profile/{userId}',
    handler: handlers.actHandlerNeedsUser('load_user_profile', 'userId', {isOwn: true}),
    config: {
      auth: auth.apiUser,
      description: 'Get user profile',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/invite-ninja',
    handler: handlers.actHandlerNeedsUser('invite_ninja'),
    config: {
      auth: auth.apiUser,
      description: 'Invite child',
      tags: ['api', 'users']
    }
  }, {
    method: 'POST',
    path: options.basePath + '/profiles/approve-invite-ninja',
    handler: handlers.actHandlerNeedsUser('approve_invite_ninja'),
    config: {
      auth: auth.apiUser,
      description: 'Approve child invitation',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/profiles/ninjas-for-user/{userId}',
    handler: handlers.actHandlerNeedsUser('ninjas_for_user', 'userId'),
    config: {
      auth: auth.apiUser,
      description: 'Children for user',
      tags: ['api', 'users']
    }
  },
  {
    method: 'GET',
    path: options.basePath + '/profiles/ping',
    handler: handlers.actHandler('ping'),
    config: {
      description: 'Ping endpoint',
      notes: 'Returns the status of the server',
      tags: ['api']
    }
  }]);

  function handleAvatarImage (request, reply) {
    var user = request.user ? request.user.user : null;
    var msg = _.defaults({user: user, role: 'cd-profiles', cmd: 'get_avatar', id: request.params.id}, request.payload);
    request.seneca.act(msg, function (err, res) {
      if (err || !res) {
        // send default profile pic
        return reply(defaultImage).header('Content-Type', 'image/png').header('Content-Length', defaultImage.length);
      }

      var buf = new Buffer(res.imageData, 'base64');
      return reply(buf).header('Content-Type', 'image/png').header('Content-Length', buf.length);
    });
  }

  next();
};

exports.register.attributes = {
  name: 'api-profiles'
};
