;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdBadgeCert', {
      bindings: {
        badge: '<'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-badge-cert'
    })
}());
