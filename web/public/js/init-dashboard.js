(function() {
  'use strict';

  function cdDashboardCtrl($scope, auth) {
  }

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
  }

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
  }

  angular.module('cpZenPlatform')
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
      $locationProvider.html5Mode(true);
      function valToString(val)   { return val !== null ? val.toString() : val; }
      function valFromString(val) { return val != null ? val.toString() : val; }
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
        .state("dojo-list", {
          url: "/dashboard/dojo-list",
          templateUrl: '/dojos/template/dojo-list',
          resolve: {
            gmap: gmap
          },
          controller: 'dojo-list-controller'
        })
        .state("my-dojos", {
          url: "/dashboard/my-dojos",
          templateUrl: '/dojos/template/my-dojos',
          controller: 'my-dojos-controller'
        })
        .state("create-dojo", {
          url: "/dashboard/create-dojo",
          templateUrl: '/dojos/template/edit-dojo',
          resolve: {
            gmap: gmap
          },
          controller: 'create-dojo-controller'
        })
        .state("edit-dojo", {
          url: "/dashboard/edit-dojo/:id",
          templateUrl: '/dojos/template/edit-dojo',
          resolve: {
            gmap: gmap
          },
          controller: 'edit-dojo-controller'
        })
        .state("dojo-detail", {
          url: "/dashboard/dojo/{country:[a-zA-Z]{2}}/{path:nonURIEncoded}",
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
        .state("manage-dojos", {
          url: "/dashboard/manage-dojos",
          templateUrl: '/dojos/template/manage-dojos',
          controller: 'manage-dojo-controller'
        })
        .state("stats", {
          url: "/dashboard/stats",
          templateUrl: '/dojos/template/stats',
          controller: 'stats-controller'
        })
        .state("champion-onboarding", {
          url: "/dashboard/champion-onboarding",
          templateUrl: '/champion/template/create',
          controller: 'champion-onboarding-controller'
        })
        .state("start-dojo-wizard", {
          url: "/dashboard/start-dojo",
          templateUrl: '/dojos/template/start-dojo-wizard/wizard',
          resolve: {
            gmap: gmap
          },
          controller: 'start-dojo-wizard-controller'
        })
        .state("review-champion-application", {
          url: "/dashboard/champion-applications/:id",
          templateUrl: '/champion/template/review-application',
          controller: 'review-champion-application-controller'
        })
        .state("manage-dojo-users", {
          url: "/dashboard/dojo/:id/users",
          templateUrl: '/dojos/template/manage-dojo-users',
          controller: 'manage-dojo-users-controller'
        })
        .state("accept-dojo-user-invitation", {
          url: "/dashboard/accept_dojo_user_invitation/:dojoId/:userInviteToken",
          templateUrl: '/dojos/template/accept-dojo-user-invitation',
          controller: 'accept-dojo-user-invitation-controller'
        })
        .state("accept-dojo-user-request", {
          url: "/dashboard/accept_dojo_user_request/:userId/:userInviteToken",
          templateUrl: '/dojos/template/accept-dojo-user-request',
          controller: 'accept-dojo-user-request-controller'
        })
        .state("user-profile", {
          url: "/dashboard/profile/:userId/",
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
        $urlRouterProvider.when('/dashboard', '/dashboard/dojo-list');
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
        }
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
    .controller('dashboard', ['$scope', 'auth', 'alertService', 'spinnerService', cdDashboardCtrl])
    .service('cdApi', seneca.ng.web({
      prefix: '/api/1.0/'
    }));
})();

