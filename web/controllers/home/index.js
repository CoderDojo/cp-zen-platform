const auth = require('../../lib/authentications');

module.exports = [
  {
    method: 'GET',
    path: '/create-dojo',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/start-dojo',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/charter',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/dojo-list-index',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/terms-and-conditions',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/privacy-statement',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/dojo/{id}/{alpha2*}',
    handler(request, reply) {
      reply.redirect(`/dojos/${request.params.id}/${request.params.alpha2}`);
    },
    config: {
      plugins: {
        senecaPreloader: {
          handler: 'seneca-dojo-preloader',
        },
      },
    },
  },

  {
    method: 'GET',
    path: '/dojo/{id}',
    handler(request, reply) {
      reply.redirect(`/dojos/${request.params.id}`);
    },
  },

  {
    method: 'GET',
    path: '/dojo/{dojoId}/event/{eventId}',
    handler(request, reply) {
      reply.view('index', request.app);
    },
    config: {
      plugins: {
        senecaPreloader: {
          handler: 'seneca-event-preloader',
        },
      },
    },
  },

  {
    method: 'GET',
    path: '/event/{eventId}',
    handler(request, reply) {
      reply.redirect(`/events/${request.params.eventId}`);
    },
  },

  {
    method: 'GET',
    path: '/accept_dojo_user_invitation/{dojoId}/{userInviteToken}',
    config: {
      auth: auth.basicUser,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login',
        },
      },
    },
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/accept_dojo_user_request/{userId}/{userInviteToken}',
    config: {
      auth: auth.basicUser,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login',
        },
      },
    },
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path:
      '/accept-parent-guardian-request/{parentProfileId}/{childProfileId}/{inviteToken}',
    config: {
      auth: auth.basicUser,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login',
        },
      },
    },
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/profile/{userId}',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/badges',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/poll/{pollId}',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/poll/{pollId}/dojo/{dojoId}',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/templates/privacy-statement',
    handler(request, reply) {
      reply.view('privacy-statement/privacy-statement', request.app);
    },
  },

  {
    method: 'GET',
    path: '/templates/reset_password',
    handler(request, reply) {
      reply.view('accounts/reset_password', request.app);
    },
  },

  {
    method: 'GET',
    path: '/maintenance',
    handler(request, reply) {
      reply.view('index', request.app);
    },
  },

  {
    method: 'GET',
    path: '/templates/maintenance',
    handler(request, reply) {
      reply.view('maintenance/maintenance', request.app);
    },
  },
];
