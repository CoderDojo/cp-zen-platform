'use strict';

function cdDojoDetailCtrl($scope, $window, $stateParams, $location, cdDojoService, alertService) {
  $scope.dojo = cdDojoService.getDojo();
}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$window', '$stateParams', '$location', 'cdDojoService', 'alertService', cdDojoDetailCtrl]);