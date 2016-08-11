;(function() {
  'use strict';

function cdChoseRole(){
    return {
      restrict: 'A',
      controller: ['$scope', '$uibModal', function ($scope, $uibModal) {
        var cdCR = this;
        this.roles = $scope.roles;
        this.selected = {};
        this.callback = $scope.modalCallback;
        this.class = "col-xs-12 col-md-" + Math.round(12/this.roles.length);

        this.submit = function () {
          var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: '/directives/tpl/dojo/join-dojo/modal',
              size: 'lg',
              controller: function($scope){
                $scope.select = function(role) {
                  modalInstance.close(role);
                }
                $scope.close = modalInstance.dismiss;
              },
              scope: $scope
           });

           modalInstance.result.then(function(selectedRole) {
             $scope.modalData.userType = selectedRole;
             if (cdCR.callback) cdCR.callback($scope.modalData);
           });
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
