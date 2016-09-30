'use strict';

function dojoSetupConfirmationCtrl($scope, $uibModalInstance){
  $scope.ok = function () {
    $uibModalInstance.close(true);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

}

angular.module('cpZenPlatform')
  .controller('dojoSetupConfirmationCtrl', ['$scope', '$uibModalInstance', dojoSetupConfirmationCtrl]);
