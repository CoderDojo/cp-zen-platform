;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarInfoItem', {
      bindings: {
        href: '@',
        icon: '@',
        actionTitle: '@',
        color: '@'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-info-item'
    });

}());
