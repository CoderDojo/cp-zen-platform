;(function() {
  'use strict';

function cdDojoActions(){
    return {
      scope: {
        isDojoAdmin: '@?',
        dojo: '='
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-actions/cd-dojo-actions',
      controller: ['$scope', 'dojoUtils', '$state', function ($scope, dojoUtils, $state) {
        var cdDA = this;
        var conditionWatcher = $scope.$watch('isDojoAdmin', function(newCd, oldCd){
          if (newCd) {
            cdDA.isDojoAdmin = newCd;
            conditionWatcher();
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
