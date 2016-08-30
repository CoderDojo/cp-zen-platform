;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdActionBar', {
      bindings: {
        open: '='
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar',
      transclude: true
    });

}());
