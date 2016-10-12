;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdActionBar', {
      bindings: {
        open: '<',
        forceFixed: '<'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar',
      transclude: true,
      controller: ['$element', function ($element) {
        var ctrl = this;
        var $footer = $('#footer');
        // If inview has never been set, the event won't trigger until the element is actually scrolled in/out of view
        // By setting inview to true, the event will trigger after binding the handler, so we can know where the footer is at the start
        // This does rely on an implementation detail in jquery.inview, so be wary when updating the plugin
        $footer.data('inview', true);

        ctrl.overflowOpen = false;
        ctrl.showOverflowButton = false;

        var actionBar;

        ctrl.$onInit = function () {
          actionBar = $element.find('.cd-action-bar');
          $element.detach();
          $element.appendTo('.cd-menu__content-container');
          $footer.on('inview', function (event, isInView) {
            if (isInView) {
              if (!ctrl.forceFixed) {
                actionBar.removeClass('cd-action-bar--fixed');
              }
              ctrl.fixed = false;
            } else {
              actionBar.addClass('cd-action-bar--fixed');
              ctrl.fixed = true;
            }
          });
        };

        ctrl.$onDestroy = function () {
          $footer.off('inview');
          $element.remove();
        };

        ctrl.$onChanges = function (changes) {
          if (changes.forceFixed) {
            if (changes.forceFixed.currentValue === true) {
              actionBar.addClass('cd-action-bar--fixed');
            } else if (changes.forceFixed.currentValue === false && ctrl.fixed === false) {
              actionBar.removeClass('cd-action-bar--fixed');
            }
          }
        }
      }]
    });

}());
