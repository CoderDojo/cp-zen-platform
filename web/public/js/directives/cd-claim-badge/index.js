;(function() {
  'use strict';

function cdClaimBadge(){
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/directives/tpl/cd-claim-badge',
      controller: function($scope, $state) {
        $scope.state = $state;
      },
      link: function (scope, element, attrs) {
        if(_.isEmpty(attrs.cdClaimBadge)) {
          element.on('click', function(){
            scope.state.go('badges-dashboard');
          });
        }
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdClaimBadge', cdClaimBadge)

}());
