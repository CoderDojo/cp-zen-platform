(function() {
  'use strict';

  function manageDojoEventsCtrl($scope, $stateParams, $location) {

    var dojo = {
      id: $stateParams.dojoId
    };

    $scope.createEvent = function() {
      $location.path('/dashboard/dojo/' + dojo.id + '/event-form');
    };
  }

  angular.module('cpZenPlatform')
    .controller('manage-dojo-events-controller', ['$scope', '$stateParams', '$location', manageDojoEventsCtrl]);

})();

