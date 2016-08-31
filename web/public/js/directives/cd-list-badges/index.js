;(function() {
  'use strict';

function cdListBadges(){
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/directives/tpl/cd-list-badges',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdListBadges', cdListBadges)
}());
