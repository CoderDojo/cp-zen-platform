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
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $stateProvider
        .state("home", {
          url: "/",
          templateUrl: '/dojos/template/dojo-list',
          resolve: {
            gmap: gmap
          },
          params: {
            bannerType: null,
            bannerMessage: null,
            bannerTimeCollapse: null
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
          url: "/dojo/{country:[a-zA-Z]{2}}/{path:.*}",
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
        .state("setup-dojo", {
          url: "/dashboard/setup-dojo/:id",
          templateUrl: '/dojos/template/setup-dojo',
          controller: 'setup-dojo-controller'
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
    .config(function($intercomProvider) {
      // Either include your app_id here or later on boot
      $intercomProvider
        .appID('z2ovnp7s');

      // you can include the Intercom's script yourself or use the built in async loading feature
      $intercomProvider
        .asyncLoading(true)
    })
    .config(['$httpProvider',
      function($httpProvider) {
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
      }
    ])
    .config(['$translateProvider',
      function($translateProvider) {
        $translateProvider.useUrlLoader('/locale/data?format=mf');
        $translateProvider.preferredLanguage('default');
      }
    ])
    .controller('dashboard', ['$scope', 'auth', 'alertService', 'spinnerService', cdDashboardCtrl])
    .service('cdApi', seneca.ng.web({
      prefix: '/api/1.0/'
    }));
})();

