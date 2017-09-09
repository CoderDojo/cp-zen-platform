'use strict';

var _ = require('lodash');
var auth = require('../lib/authentications');
var Joi = require('joi');

exports.register = function (server, options, next) {
  options = _.extend({ basePath: '/api/2.0' }, options);
  var handlers = require('./handlers.js')(server, 'cd-organisations');

  server.route([{
    method: 'GET',
    path: options.basePath + '/organisations',
    handler: handlers.actHandler('list', null, null, {ctrl: 'org'}),
    config: {
      description: 'List all possible organisations',
      tags: ['api', 'users']
    }
  }, {
    method: 'GET',
    path: options.basePath + '/organisations/{id}',
    handler: handlers.actHandler('load', ['id'], null, {ctrl: 'org'}),
    config: {
      description: 'Get organisation by id',
      tags: ['api', 'users'],
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/organisations',
    handler: handlers.actHandlerNeedsUser('create', null, null, {ctrl: 'org'}),
    config: {
      auth: auth.apiUser,
      description: 'Create organisation',
      tags: ['api', 'users'],
      validate: {
        payload: {
          org: {
            name: Joi.string().required()
          }
        }
      }
    }
  }, {
    method: 'PUT',
    path: options.basePath + '/organisation/{id}',
    handler: handlers.actHandlerNeedsUser('update', ['id'], null, {ctrl: 'org'}),
    config: {
      auth: auth.apiUser,
      description: 'Accept badge',
      tags: ['api', 'users'],
      validate: {
        payload: {
          org: {
            name: Joi.string().required()
          }
        }
      }
    }
  }, {
    method: 'GET',
    path: options.basePath + '/organisations/{orgId}/users',
    handler: handlers.actHandlerNeedsUser('list', ['orgId'], null, {ctrl: 'userOrg'}),
    config: {
      auth: auth.apiUser,
      description: 'Load organisation\'s users',
      tags: ['api', 'users'],
      validate: {
        params: {
          orgId: Joi.string().required()
        }
      }
    }
  }, { method: 'GET',
    path: options.basePath + '/user/{userId}/organisations',
    handler: handlers.actHandlerNeedsUser('list', ['userId'], null, {ctrl: 'userOrg'}),
    config: {
      auth: auth.apiUser,
      description: 'Load user\'s organisation\'s',
      tags: ['api', 'users'],
      validate: {
        params: {
          userId: Joi.string().guid().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/users/organisations',
    handler: handlers.actHandlerNeedsUser('list', null, null, {ctrl: 'userOrg'}),
    config: {
      auth: auth.apiUser,
      description: 'Load organisation\'s users',
      tags: ['api', 'users'],
      validate: {
        payload: {
          userIds: Joi.array().items(Joi.string().guid())
        }
      }
    }
  }, {
    method: 'POST',
    path: options.basePath + '/organisations/{orgId}/users',
    handler: handlers.actHandlerNeedsUser('create', ['orgId'], null, {ctrl: 'userOrg'}),
    config: {
      auth: auth.apiUser,
      description: 'Create organisation member',
      tags: ['api', 'users'],
      validate: {
        payload: {
          userOrg: {
            userId: Joi.string().required(),
            orgId: Joi.string().required()
          }
        }
      }
    }
  }, {
    method: 'DELETE',
    path: options.basePath + '/organisations/{orgId}/users/{userId}',
    handler: handlers.actHandlerNeedsUser('delete', ['orgId', 'userId'], null, {ctrl: 'userOrg'}),
    config: {
      auth: auth.apiUser,
      description: 'Delete organisation member',
      tags: ['api', 'users'],
      validate: {
        params: {
          userId: Joi.string().required(),
          orgId: Joi.string().required()
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-orgs',
  dependencies: 'cd-auth',
};
