(function() {
  'use strict';

  function manageDojoEventsCtrl($scope, $stateParams, $state) {

    var dojoId = $stateParams.dojoId;

    $scope.createEvent = function() {
      $state.go('create-dojo-event', {dojoId: dojoId});
    };
  }

  angular.module('cpZenPlatform')
    .controller('manage-dojo-events-controller', ['$scope', '$stateParams', '$state', manageDojoEventsCtrl]);

})();

