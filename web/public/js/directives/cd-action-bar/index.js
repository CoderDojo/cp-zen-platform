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
      transclude: true,
      controller: ['$element', function ($element) {
        var ctrl = this;

        ctrl.$onInit = function () {
          var actionBar = $element.find('.cd-action-bar');
          $('#footer').on('inview', function (event, isInView) {
            if (isInView) {
              actionBar.removeClass('cd-action-bar--fixed');
            } else {
              actionBar.addClass('cd-action-bar--fixed');
            }
          });
        };

        ctrl.$onDestroy = function () {
          $('#footer').off('inview');
        };
      }]
    });

}());
