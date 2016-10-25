;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdAnchor', {
      bindings: {
        anchorText: '<'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-anchor',
      controller: ['$element', function ($element) {
        var ctrl = this;
        ctrl.$onInit = function () {
        };

        ctrl.$onDestroy = function () {
          $element.remove();
        };
      }]
    });
}());
