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
      var langCookie = request.state.NG_TRANSLATE_LANG_KEY;
      
      var code = langCookie ? langCookie.replace(/%22/g, '').split('_')[0] : 'en';

      var captchaURL = 'https://www.google.com/recaptcha/api.js?onload=vcRecaptchaApiLoaded&render=explicit&hl=' + code;

      request.locals.context.captchaURL = captchaURL;
       
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
    path: '/dojo/{id}/{alpha2*}',
    handler: function (request, reply) {
      if (request.params.alpha2) {
        reply.view('index', request.locals);
      }
      else {
        reply.view('dashboard/index');
      }
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
  }
];
