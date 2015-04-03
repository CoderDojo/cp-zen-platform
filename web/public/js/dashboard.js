'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'cdAuth',
  'cdCountrySelect',
  'ngCkeditor',
  'angularValidator',
  'ui.router',
  'ngStorage',
  'ngRoute',
  'ui.map'
]);

require('./services/auth-service');
require('./services/cd-charter-service');
require('./services/cd-dojo-service');
require('./services/cd-load-my-dojos-service');
require('./services/geocoder-service');

require('./controllers/login-controller');
require('./controllers/header-controller');
require('./controllers/charter-controller');
require('./controllers/dojo-list-controller');
require('./controllers/my-dojos-controller');
require('./controllers/dojo-detail-controller');

require('./controllers/create-dojo-controller');
require('./controllers/edit-dojo-controller');

require('./services/alert-service');
require('./services/spinner-service');
require('./services/table-utils');

require('./directives/country-select');

function cdDashboardCtrl($scope, auth) {
  
}

app
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('/dashboard', '/dojo-list')
      .otherwise('/dojo-list');
    $stateProvider
      .state("dojo-list", {
        url: "/dojo-list",
        templateUrl: '/dojos/template/dojo-list',
        controller:'dojo-list-controller'
      })
      .state("charter", {
        url: "/charter",
        templateUrl:'/charter/template/index',
        controller:'charter-controller'
      })
      .state("my-dojos", {
        url: "/my-dojos",
        templateUrl:'/dojos/template/my-dojos',
        controller:'my-dojos-controller'
      })
      .state("create-dojo", {
        url: "/create-dojo",
        templateUrl:'/dojos/template/create-dojo',
        resolve: {
          gmap: function($q, $window) {
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
              'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady');
            doc.head.appendChild(scriptTag);
            $window.mapReady = (function(dfd) {
              return function() {
                dfd.resolve(true);
                delete $window.mapReady;
              };
            }(dfd));
            
            return dfd.promise;
          }
        },
        controller:'create-dojo-controller'
      })
      .state("edit-dojo", {
        url: "/edit-dojo",
        templateUrl:'/dojos/template/edit-dojo',
        resolve: {
          gmap: function($q, $window) {
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
              'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady');
            doc.head.appendChild(scriptTag);
            $window.mapReady = (function(dfd) {
              return function() {
                dfd.resolve(true);
                delete $window.mapReady;
              };
            }(dfd));
            
            return dfd.promise;
          }
        },
        controller:'edit-dojo-controller'
      })
      .state("dojo-detail", {
        url: "/dojo/:id",
        templateUrl: '/dojos/template/dojo-detail',
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
  .controller('dashboard', ['$scope', 'auth', 'alertService', 'spinnerService', cdDashboardCtrl])
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
;
