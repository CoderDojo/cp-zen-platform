;(function() {
  'use strict';

function cdDojoActions(){
    return {
      scope: {
        canManageDojo: '=',
        canManageEvents: '=',
        dojo: '='
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-actions',
      controller: ['$scope', 'dojoUtils', '$state', function ($scope, dojoUtils, $state) {
        var cdDA = this;
        var isDojoAdminWatcher = $scope.$watch('canManageDojo', function(newCd, oldCd){
          if (newCd) {
            cdDA.canManageDojo = newCd;
            isDojoAdminWatcher();
          }
        });
        var isDojoTicketingWatcher = $scope.$watch('canManageEvents', function(newCd, oldCd){
          if (newCd) {
            cdDA.canManageEvents = newCd;
            isDojoTicketingWatcher();
          }
        });
        this.dojo = $scope.dojo;
        this.currentState = $state.current.name;
        this.previewUrl = dojoUtils.getDojoURL(cdDA.dojo);
      }],
      controllerAs: 'cdDA'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoActions', [cdDojoActions]);

}());
