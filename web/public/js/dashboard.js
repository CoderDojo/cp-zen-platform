'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  //'angularMoment'
  //'darthwade.dwLoading',
  'cdAuth',
]);

require('./services/auth-service');
//require('./services/alert-service');
//require('./services/spinner-service');
require('./controllers/login-controller');
require('./controllers/header-controller');
//require('./controllers/left-navigation-controller');

function cdDashboardCtrl($scope, auth) {

}

app
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .controller('dashboard', ['$scope', 'auth', /*'spinnerService', 'alertService',*/ cdDashboardCtrl])
  //.controller('dashboard', ['$scope', cdDashboardCtrl])
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
;
