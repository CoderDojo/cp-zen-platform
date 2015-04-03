'use strict';

function cdDojoDetailCtrl($scope, $window, $stateParams, $location, cdDojoService, alertService) {
  $scope.dojo = cdDojoService.getDojo();
  if(_.isEmpty($scope.dojo)) {
  	cdDojoService.load($stateParams.id, function(response) {
  		$scope.dojo = response;
  	})
  }
  
}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$window', '$stateParams', '$location', 'cdDojoService', 'alertService', cdDojoDetailCtrl]);