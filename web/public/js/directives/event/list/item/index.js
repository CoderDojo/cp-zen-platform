;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEventListItem', function () {
        return {
          restrict: 'AE',
          templateUrl: '/directives/tpl/event/list/item',
        };
    });

}());
