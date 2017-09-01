const auth = require('../../../lib/authentications');

module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/reset',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/register',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/create-dojo',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/start-dojo',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/charter',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/dojo-list-index',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/terms-and-conditions',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/privacy-statement',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/dojo/{id}/{alpha2*}',
    handler({ params }, reply) {
      reply.redirect(`/dojos/${params.id}/${params.alpha2}`);
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
    handler({ locals }, reply) {
      reply.view('index', locals);
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
    handler({ locals }, reply) {
      reply.view('index', locals);
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
    path: '/accept_dojo_user_invitation/{dojoId}/{userInviteToken}',
    config: {
      auth: auth.basicUser,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login',
        },
      },
    },
    handler({ locals }, reply) {
      reply.view('index', locals);
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
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/accept-parent-guardian-request/{parentProfileId}/{childProfileId}/{inviteToken}',
    config: {
      auth: auth.basicUser,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: '/login',
        },
      },
    },
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/profile/{userId}',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/reset_password/{token}',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/badges',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/poll/{pollId}',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/poll/{pollId}/dojo/{dojoId}',
    handler({ locals }, reply) {
      reply.view('index', locals);
    },
  },

  {
    method: 'GET',
    path: '/templates/login',
    handler({ locals }, reply) {
      reply.view('accounts/login', locals);
    },
  },

  {
    method: 'GET',
    path: '/templates/register',
    handler({ locals }, reply) {
      reply.view('accounts/register', locals);
    },
  },

  {
    method: 'GET',
    path: '/templates/terms-and-conditions',
    handler({ locals }, reply) {
      reply.view('accounts/terms-and-conditions', locals);
    },
  },

  {
    method: 'GET',
    path: '/templates/privacy-statement',
    handler({ locals }, reply) {
      reply.view('privacy-statement/privacy-statement', locals);
    },
  },

  {
    method: 'GET',
    path: '/templates/reset_password',
    handler({ locals }, reply) {
      reply.view('accounts/reset_password', locals);
    },
  },
];
