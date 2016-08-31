;(function() {
  'use strict';

function cdClaimBadgeButton(){
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/directives/tpl/cd-claim-badge-button',
      controller: function($scope, $state) {
        $scope.state = $state;
      },
      link: function (scope, element, attrs) {
        if(_.isEmpty(attrs.cdClaimBadgeButton)) {
          element.on('click', function(){
            scope.state.go('badges-dashboard');
          });
        }
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdClaimBadgeButton', cdClaimBadgeButton)
}());
