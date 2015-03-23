'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'cdAuth',
  'cdCharter'
]);

require('./services/auth-service');
require('./controllers/login-controller');
require('./controllers/header-controller');

function cdDashboardCtrl($scope, auth) {

}

app
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
  .controller('dashboard', ['$scope', 'auth', cdDashboardCtrl])
;
