'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls'
]);

require('./services/auth-service');
//require('./services/alert-service');
require('./controllers/login-controller');
//require('./controllers/create-account-controller');
//require('./controllers/confirm-account-controller');
//require('./controllers/reset-password-controller');
require('./controllers/header-controller');
//require('./controllers/left-navigation-controller');

function ApiHttpInterceptor($provide, $httpProvider) {
  // Intercept http calls.
  $provide.factory('ApiHttpInterceptor', function ($q) {
    return {
      // On request success
      request: function (config) {
        // console.log(config); // Contains the data about the request before it is sent.
        // Return the config or wrap it in a promise if blank.
        return config || $q.when(config);
      },

      // On request failure
      requestError: function (rejection) {
        // console.log(rejection); // Contains the data about the error on the request.
        // Return the promise rejection.
        return $q.reject(rejection);
      },

      // On response success
      response: function (response) {
        // console.log(response); // Contains the data from the response.
        // Return the response or promise.
        return response || $q.when(response);
      },

      // On response failure
      responseError: function (rejection) {
        // console.log(rejection); // Contains the data about the error on the response.
        // Return the promise rejection.
        return $q.reject(rejection);
      }
    };
  });

  // Add the interceptor to the $httpProvider.
  $httpProvider.interceptors.push('ApiHttpInterceptor');
}

app
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .config(['$provide', '$httpProvider', ApiHttpInterceptor])
  .service('cdRest', seneca.ng.web({prefix:'/api/1.0/rest/cp_zen_platform_'}))
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
  .service('cdPubSub',   seneca.ng.pubsub())
;

