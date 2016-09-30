;(function() {
  'use strict';

function cdClaimBadge(){
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/directives/tpl/cd-claim-badge',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdClaimBadge', cdClaimBadge)
}());
