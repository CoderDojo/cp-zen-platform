;(function() {
  'use strict';

function cdUserActions(){
    return {
      scope: {
        canEdit: '=',
        user: '='
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/user/user-actions',
      controller: ['$scope', '$state', function ($scope, $state) {
        var cdUA = this;
        var conditionWatcher = $scope.$watch('canEdit', function(newCd, oldCd){
          if (newCd) {
            cdUA.canEdit = newCd;
            conditionWatcher();
          }
        });
        this.user = $scope.user;
        this.currentState = $state.current.name;
      }],
      controllerAs: 'cdUA'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdUserActions', [cdUserActions]);

}());
