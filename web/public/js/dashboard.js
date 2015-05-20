'use strict';

var app = angular.module('cpZenPlatform', [
  'pascalprecht.translate',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'cdAuth',
  'cdCountrySelect',
  'ngCkeditor',
  'angularValidator',
  'ui.router',
  'ngStorage',
  'ngRoute',
  'ui.select',
  'ngSanitize',
  'ui.map',
  'truncate',
  'mgo-angular-wizard',
  'checklist-model',
  'sbDateSelect',
  'angular-alert-banner',
  'angularSpinner'
]);

require('./services/auth-service');
require('./services/cd-charter-service');
require('./services/cd-dojo-service');
require('./services/geocoder-service');
require('./services/cd-countries-service');
require('./services/cd-profiles-service');

require('./controllers/login-controller');
require('./controllers/header-controller');
require('./controllers/dojo-list-controller');
require('./controllers/my-dojos-controller');
require('./controllers/dojo-detail-controller');
require('./controllers/dojo-list-index-controller');
require('./controllers/create-dojo-controller');
require('./controllers/edit-dojo-controller');
require('./controllers/manage-dojo-controller');
require('./controllers/stats-controller');
require('./controllers/champion-onboarding-controller');
require('./controllers/start-dojo-wizard-controller');
require('./controllers/review-champion-application-controller');
require('./controllers/manage-dojo-users-controller');
require('./controllers/accept-dojo-mentor-invitation-controller');
require('./controllers/accept-dojo-mentor-request-controller');

require('./services/alert-service');
require('./services/spinner-service');
require('./services/table-utils');
require('./services/cd-users-service');
require('./services/cd-agreements-service');

require('./directives/country-select');
//--Dojo Wizard Directives--//
require('./directives/cd-register-account');
require('./directives/cd-champion-registration');
require('./directives/cd-dojo-listing');
require('./directives/cd-charter');
require('./directives/cd-setup-your-dojo');
//--//

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
      function (data) {
      dfd.resolve(data);
    }, function (err) {
      dfd.reject(err);
    });
  }
  else {
    cdDojoService.find({
      urlSlug: $stateParams.country + '/' + $stateParams.path
    }, function (data) {
      dfd.resolve(data);
    }, function (err) {
      dfd.reject(err);
    });
  }
  return dfd.promise;
}

app
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
      .state("home", {
        url: "/",
        templateUrl: '/dojos/template/dojo-list',
        resolve: {
          gmap:gmap
        },
        params: {
          bannerType:null,
          bannerMessage:null
        },
        controller:'dojo-list-controller'
      })
      .state("dojo-list", {
        url: "/dashboard/dojo-list",
        templateUrl: '/dojos/template/dojo-list',
        resolve: {
          gmap:gmap
        },
        controller:'dojo-list-controller'
      })
      .state("my-dojos", {
        url: "/dashboard/my-dojos",
        templateUrl:'/dojos/template/my-dojos',
        controller:'my-dojos-controller'
      })
      .state("create-dojo", {
        url: "/dashboard/create-dojo",
        templateUrl:'/dojos/template/edit-dojo',
        resolve: {
          gmap: gmap
        },
        controller:'create-dojo-controller'
      })
      .state("edit-dojo", {
        url: "/dashboard/edit-dojo/:id",
        templateUrl:'/dojos/template/edit-dojo',
        resolve: {
          gmap:gmap
        },
        controller:'edit-dojo-controller'
      })
      .state("dojo-detail", {
        url: "/dashboard/dojo/{country:[a-zA-Z]{2}}/{path:.*}",
        templateUrl: '/dojos/template/dojo-detail',
        resolve: {
          dojo:resolveDojo,
          gmap:gmap
        },
        controller:'dojo-detail-controller'
      })
      .state("dojo-detail-alt", {
        url: "/dojo/:id",
        templateUrl: '/dojos/template/dojo-detail',
        resolve: {
          dojo:resolveDojo,
          gmap:gmap
        },
        controller:'dojo-detail-controller'
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
          gmap:gmap
        },
        controller:'start-dojo-wizard-controller'
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
      .state("accept-dojo-mentor-invitation", {
        url: "/dashboard/accept_dojo_mentor_invitation/:dojoId/:mentorInviteToken",
        templateUrl: '/dojos/template/accept-dojo-mentor-invitation',
        controller: 'accept-dojo-mentor-invitation-controller'
      })
      .state("accept-dojo-mentor-request", {
        url: "/dashboard/accept_dojo_mentor_request/:userId/:mentorInviteToken",
        templateUrl: '/dojos/template/accept-dojo-mentor-request',
        controller: 'accept-dojo-mentor-request-controller'
      });
      $urlRouterProvider.when('/dashboard', '/dashboard/dojo-list');
  })
  .config(function(paginationConfig){
    paginationConfig.maxSize = 5;
    paginationConfig.rotate = false;
  })
  .factory('authHttpResponseInterceptor',['$q','$window',function($q, $window){
    return {
      responseError: function(rejection) {
        if (rejection.status === 401) {
            $window.location = "/";
        }
        return $q.reject(rejection);
      }
    }
  }])
  .config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
  }])
  .config(['$translateProvider', function($translateProvider) {
    $translateProvider.useUrlLoader('/locale/data?format=mf');
    $translateProvider.preferredLanguage('default');
  }])
  .controller('dashboard', ['$scope', 'auth', 'alertService', 'spinnerService', cdDashboardCtrl])
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
;
