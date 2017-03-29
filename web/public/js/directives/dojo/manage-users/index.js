;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .directive('cdManageDojoUsers', function () {
      return {
        restrict: 'AE',
        templateUrl: '/directives/tpl/dojo/manage-users',
        controller:
        ['$scope', '$state',
          function ($scope, $state) {
            $scope.pendingUsers = [];
            $scope.activeUsers = [];
            $scope.activeState = $state.current.name === 'manage-dojo-pending-users' ? 2 : 1;
        }]
    };
  });

}());
