'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'cdAuth',
  'cdCountrySelect',
  'uiGmapgoogle-maps',
  'ngCkeditor',
  'angularValidator',
  'ui.router'
]);

require('./services/auth-service');
require('./services/cd-charter-service');
require('./services/cd-dojo-service');
require('./services/cd-load-my-dojos-service');

require('./controllers/login-controller');
require('./controllers/header-controller');
require('./controllers/charter-controller');
require('./controllers/dojo-list-controller');
require('./controllers/my-dojos-controller');
require('./controllers/create-dojo-controller');
require('./controllers/edit-dojo-controller');

require('./services/alert-service');
require('./services/spinner-service');
require('./services/table-utils');
require('./directives/country-select');
require('./directives/cd-charter');
require('./directives/cd-dojo-list');
require('./directives/cd-my-dojos');
require('./directives/cd-create-dojo');


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
        controller:'create-dojo-controller'
      })
      .state("edit-dojo", {
        url: "/edit-dojo",
        templateUrl:'/dojos/template/edit-dojo',
        controller:'edit-dojo-controller'
      });
  })
  .config(function(paginationConfig){
    paginationConfig.maxSize = 5;
    paginationConfig.rotate = false;
  })
  .config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
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
