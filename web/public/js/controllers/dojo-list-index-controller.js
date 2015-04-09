'use strict';

function cdDojoListIndexCtrl($scope, $location, cdDojoService) {
  cdDojoService.list({}, function(response) {
    $scope.dojoData = response;
  });

  $scope.viewDojo = function(dojo) {
    cdDojoService.setDojo(dojo, function(response) {
      $location.path('/dojo/' + dojo.id);
    }, function (err){
      if(err){
        alertService.showError(
          'An error has occurred while editing dojo: <br /> '+
          (err.error || JSON.stringify(err))
        );
      }
    });
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-list-index-controller', ['$scope', '$location', 'cdDojoService', cdDojoListIndexCtrl]);