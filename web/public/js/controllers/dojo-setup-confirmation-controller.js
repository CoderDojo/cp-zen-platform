'use strict';

function dojoSetupConfirmationCtrl($scope, $modalInstance){
  $scope.ok = function () {
    $modalInstance.close(true);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

}

angular.module('cpZenPlatform')
  .controller('dojoSetupConfirmationCtrl', ['$scope', '$modalInstance', dojoSetupConfirmationCtrl]);