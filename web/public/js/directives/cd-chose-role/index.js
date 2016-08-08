;(function() {
  'use strict';

function cdChoseRole(){
    return {
      restrict: 'A',
      controller: ['$scope', '$uibModal', function ($scope, $uibModal) {
        var cdCR = this;
        this.roles = $scope.roles;
        this.selected = {};

        this.submit = function () {
          var modalInstance = $uibModal.open({
               animation: $scope.animationsEnabled,
               template: '<ul class="list-unstyled list-inline">' +
                           '<li ng-repeat="role in cdCR.roles" ng-click="select(role)">' +
                             '{{ role.name }}' +
                           '</li>' +
                         '</ul>',
              controller: function($scope){
                $scope.select = function(role) {
                  modalInstance.close(role);
                }
              },
              scope: $scope
           });

           modalInstance.result.then(function(selectedRole) {
               cdCR.selected = selectedRole;
           }, function() {});
        }
      }],
      link: function(scope, element) {
        element.on('click', scope.cdCR.submit);
      },
      controllerAs: 'cdCR'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdChoseRole', [cdChoseRole]);

}());
