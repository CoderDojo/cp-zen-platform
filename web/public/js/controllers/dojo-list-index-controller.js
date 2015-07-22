'use strict';

function cdDojoListIndexCtrl($scope, $location, cdDojoService) {

  cdDojoService.list({}, function(response) {
    $scope.dojoList = response;
  });

  $scope.viewDojo = function(dojo) {
    $location.path('/dojo/' + dojo.urlSlug);
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-list-index-controller', ['$scope', '$location', 'cdDojoService', cdDojoListIndexCtrl]);
