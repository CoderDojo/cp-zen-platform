'use strict';

var app = angular.module('cpZenPlatform', [
  'pascalprecht.translate',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'ngStorage',
  'ngRoute',
  'ui.router',
  'ngCkeditor',
  'angularValidator',
  'ui.map',
  'ui.select',
  'ngSanitize',
  'mgo-angular-wizard',
  'checklist-model',
  'sbDateSelect',
  'angular-alert-banner'
]);

/*
TODO: move to e.g. layout template
require('./controllers/login-controller');
require('./controllers/header-controller');
require('./controllers/dojo-list-controller');
require('./controllers/create-dojo-controller');
require('./controllers/dojo-list-index-controller');
require('./controllers/dojo-detail-controller');
require('./controllers/start-dojo-wizard-controller');
require('./controllers/terms-and-conditions-controller');

require('./services/cd-dojo-service');
require('./services/cd-countries-service');
require('./services/geocoder-service');
require('./services/auth-service');
require('./services/alert-service');
require('./services/cd-agreements-service');

//--Dojo Wizard Directives--//
require('./directives/cd-register-account');
require('./directives/cd-champion-registration');
require('./directives/cd-dojo-listing');
require('./directives/cd-charter');
require('./directives/cd-setup-your-dojo');
//--//
*/

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
      .state("login", {
        url: "/login",
        templateUrl: '/templates/login',
        controller:'login',
        params: {
          referer:null
        }
      })
      .state("register-account", {
        url: "/register",
        templateUrl: '/templates/register',
        controller: 'login'
      })
      .state("create-dojo-public", {
        url: "/create-dojo",
        templateUrl:'/dojos/template/edit-dojo',
        resolve: {
          gmap: gmap
        },
        controller:'create-dojo-controller'
      })
      .state("dojo-list-index", {
        url: "/dojo-list-index",
        templateUrl: '/dojos/template/dojo-list-index',
        controller:'dojo-list-index-controller'
      })
      .state("dojo-detail", {
        url: "/dojo/{country:[a-zA-Z]{2}}/{path:.*}",
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
      .state("start-dojo-wizard", {
        url: "/start-dojo",
        templateUrl: '/dojos/template/start-dojo-wizard/wizard',
        resolve: {
          gmap:gmap
        },
        controller:'start-dojo-wizard-controller'
      })
      .state("terms-and-conditions", {
        url: "/terms-and-conditions",
        templateUrl: '/templates/terms-and-conditions',
        controller:'terms-and-conditions-controller'
      });
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
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
;

