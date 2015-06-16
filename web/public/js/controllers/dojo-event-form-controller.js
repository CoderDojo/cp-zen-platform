(function() {
  'use strict';

  function dojoEventFormCtrl($scope, $stateParams, $location) {
    var dojo = {
      id: $stateParams.dojoId
    };

    if ($stateParams.eventId) {
      console.log('load event details');
    }

    $scope.fromDate = new Date();
    $scope.toDate = new Date();
    $scope.minDate = new Date();

    $scope.open = function($event, isOpen) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope[isOpen] = true;
    };

    $scope.time = new Date();
    $scope.hstep = 1;
    $scope.mstep = 15;
    $scope.ismeridian = true;

  }

  angular.module('cpZenPlatform')
    .controller('dojo-event-form-controller', ['$scope', '$stateParams', '$location', dojoEventFormCtrl]);

})();

