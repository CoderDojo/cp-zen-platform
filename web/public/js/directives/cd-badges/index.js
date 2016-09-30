;(function() {
  'use strict';

function cdBadges(){
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/directives/tpl/cd-badges',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdBadges', cdBadges)
}());
