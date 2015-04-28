'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'ngStorage',
  'ngRoute',
  'ui.router',
  'ui.map',
  'ui.select',
  'ngSanitize'
]);



require('./controllers/login-controller');
require('./controllers/header-controller');
require('./controllers/dojo-list-controller');
require('./controllers/create-dojo-controller');
require('./controllers/dojo-list-index-controller');
require('./controllers/dojo-detail-controller');

require('./services/cd-dojo-service');
require('./services/cd-countries-service');
require('./services/geocoder-service');
require('./services/auth-service');
require('./services/alert-service');

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
        templateUrl:'/dojos/template/create-dojo',
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
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }));

