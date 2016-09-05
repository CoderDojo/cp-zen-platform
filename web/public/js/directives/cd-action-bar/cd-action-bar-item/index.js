;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarItem', {
      bindings: {
        href: '@',
        icon: '@',
        title: '@',
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-item'
    });

}());
