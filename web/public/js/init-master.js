(function() {
  'use strict';

  var gmap = function($q, $window) {
    var dfd = $q.defer();
    var doc = $window.document;
    var scriptId = 'gmapScript';
    var scriptTag = doc.getElementById(scriptId);
    if (scriptTag) {
      dfd.resolve(true);
      return true;
    }
    scriptTag = doc.createElement('script');
    scriptTag.id = scriptId;
    scriptTag.setAttribute('src',
      'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady&key=AIzaSyDlOskoHwHF560s_WgZzEP3_u4OWbWuec0');
    doc.head.appendChild(scriptTag);
    $window.mapReady = (function(dfd) {
      return function() {
        dfd.resolve(true);
        delete $window.mapReady;
      };
    }(dfd));

    return dfd.promise;
  };

  var resolveDojo = function($q, $stateParams, cdDojoService) {
    var dfd = $q.defer();
    if ($stateParams.id) {
      cdDojoService.load($stateParams.id,
        function(data) {
          dfd.resolve(data);
        }, function(err) {
          dfd.reject(err);
        });
    } else {
      cdDojoService.find({
        urlSlug: $stateParams.country + '/' + $stateParams.path
      }, function(data) {
        dfd.resolve(data);
      }, function(err) {
        dfd.reject(err);
      });
    }
    return dfd.promise;
  };

  angular.module('cpZenPlatform')
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
      $locationProvider.html5Mode(true);
      function valToString(val)   { return val !== null ? val.toString() : val; }
      function valFromString(val) { return val !== null ? val.toString() : val; }
      $urlMatcherFactoryProvider.type('nonURIEncoded', {
        encode: valToString,
        decode: valFromString,
        is: function () { return true; }
      });
      $stateProvider
        .state("home", {
          url: "/",
          templateUrl: '/dojos/template/dojo-list',
          resolve: {
            gmap: gmap
          },
          params: {
            bannerType: null,
            bannerMessage: null
          },
          controller: 'dojo-list-controller'
        })
        .state("login", {
          url: "/login",
          templateUrl: '/templates/login',
          controller: 'login',
          params: {
            referer: null
          }
        })
        .state("register-account", {
          url: "/register",
          templateUrl: '/templates/register',
          params: {
            referer:null
          },
          controller: 'login'
        })
        .state("create-dojo-public", {
          url: "/create-dojo",
          templateUrl: '/dojos/template/edit-dojo',
          resolve: {
            gmap: gmap
          },
          controller: 'create-dojo-controller'
        })
        .state("dojo-list-index", {
          url: "/dojo-list-index",
          templateUrl: '/dojos/template/dojo-list-index',
          controller: 'dojo-list-index-controller'
        })
        .state("dojo-detail", {
          url: "/dojo/{country:[a-zA-Z]{2}}/{path:nonURIEncoded}",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap
          },
          controller: 'dojo-detail-controller'
        })
        .state("dojo-detail-alt", {
          url: "/dojo/:id",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap
          },
          controller: 'dojo-detail-controller'
        })
        .state("start-dojo-wizard", {
          url: "/start-dojo",
          templateUrl: '/dojos/template/start-dojo-wizard/wizard',
          resolve: {
            gmap: gmap
          },
          controller: 'start-dojo-wizard-controller'
        })
        .state("terms-and-conditions", {
          url: "/terms-and-conditions",
          templateUrl: '/templates/terms-and-conditions',
          controller: 'terms-and-conditions-controller'
        })
        .state("accept-dojo-user-invitation", {
        url: "/accept_dojo_user_invitation/:dojoId/:userInviteToken",
        templateUrl: '/dojos/template/accept-dojo-user-invitation',
        controller: 'accept-dojo-user-invitation-controller'
        })
        .state("accept-dojo-user-request", {
          url: "/accept_dojo_user_request/:userId/:userInviteToken",
          templateUrl: '/dojos/template/accept-dojo-user-request',
          controller: 'accept-dojo-user-request-controller'
        })
        .state('accept-child-invite',{
          url: '/accept-parent-guardian-request/:parentProfileId/:childProfileId/:inviteToken',
          controller: 'accept-child-controller',
          templateUrl: '/profiles/template/accept-child-invite'
        })
        .state("user-profile", {
          url: "/profile/:userId",
          templateUrl: '/dojos/template/user-profile',
          resolve: {
            profile: function($stateParams, cdUsersService){
              return cdUsersService.listProfilesPromise({userId: $stateParams.userId}).then(
                function(data){
                  return {data: data};
                }, function(err){
                  return {err: err};
                });
            },
            loggedInUser: function(auth){
              return auth.get_loggedin_user_promise().then(function(data){
                return {data: data};
              }, function(err){
                return {err: err};
              });
            },
            usersDojos: function($stateParams, cdDojoService){
              return cdDojoService.getUsersDojosPromise({userId: $stateParams.userId})
                .then(function(data){
                  return {data: data};
                }, function(err){
                  return {err: err};
                });
            }
          },
          controller: 'user-profile-controller'
        });
    })
    .config(function(paginationConfig) {
      paginationConfig.maxSize = 5;
      paginationConfig.rotate = false;
    })
    .factory('authHttpResponseInterceptor', ['$q', '$window',
      function($q, $window) {
        return {
          responseError: function(rejection) {
            if (rejection.status === 401) {
              $window.location = "/";
            }
            return $q.reject(rejection);
          }
        };
      }
    ])
    .config(['$httpProvider',
      function($httpProvider) {
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
      }
    ])
    .config(['$translateProvider',
      function($translateProvider) {
        $translateProvider.useUrlLoader('/locale/data?format=mf')
        .useCookieStorage()
        .useSanitizeValueStrategy('sanitize')
        .registerAvailableLanguageKeys(['en_US', 'de_DE'])
        .determinePreferredLanguage()
        .fallbackLanguage('en_US');
      }
    ])
    .service('cdApi', seneca.ng.web({
      prefix: '/api/1.0/'
    }));
})();

