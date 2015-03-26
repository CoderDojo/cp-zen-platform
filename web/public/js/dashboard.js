'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'cdAuth',
  'cdCharter',
  'cdDojos',
  'cdCountrySelect',
  'uiGmapgoogle-maps',
  'ngCkeditor',
  'angularValidator',
  'ngRoute' 
]);

require('./services/auth-service');
require('./controllers/login-controller');
require('./controllers/header-controller');
require('./services/alert-service');
require('./services/spinner-service');
require('./services/table-utils');
require('./directives/country-select');

function cdDashboardCtrl($scope, auth) {

}

app
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
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
