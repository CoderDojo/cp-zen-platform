;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCardTao', {
      bindings: {
        dojo: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card/cd-expanding-dojo-card-tao'
    });
}());
