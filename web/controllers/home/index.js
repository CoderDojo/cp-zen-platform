'use strict';

var controller = module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/login',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/register',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/create-dojo',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/start-dojo',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/charter',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/dojo-list-index',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/terms-and-conditions',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/privacy-statement',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/dojo/{id}/{alpha2*}',
    handler: function (request, reply) {
      if (request.params.alpha2) {
        reply.view('index', request.locals);
      }
    }
  },

  {
    method: 'GET',
    path: '/dojo/{legacyId}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/event/{eventId}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/accept_dojo_user_invitation/{dojoId}/{userInviteToken}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/accept_dojo_user_request/{userId}/{userInviteToken}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/accept-parent-guardian-request/{parentProfileId}/{childProfileId}/{inviteToken}',
    handler: function (request, reply){
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/profile/{userId}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/reset_password/{token}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/badges',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/poll/{pollId}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/poll/{pollId}/dojo/{dojoId}',
    handler: function (request, reply) {
      reply.view('index', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/templates/login',
    handler: function (request, reply) {
      reply.view('accounts/login', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/templates/register',
    handler: function (request, reply) {
      reply.view('accounts/register', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/templates/terms-and-conditions',
    handler: function (request, reply) {
      reply.view('accounts/terms-and-conditions', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/templates/privacy-statement',
    handler: function (request, reply) {
      reply.view('privacy-statement/privacy-statement', request.locals);
    }
  },

  {
    method: 'GET',
    path: '/templates/reset_password',
    handler: function (request, reply) {
      reply.view('accounts/reset_password', request.locals);
    }
  }
];
