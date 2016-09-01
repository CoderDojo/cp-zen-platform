;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdActionBar', {
      bindings: {
        open: '<'
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

        ctrl.$onInit = function () {
          var actionBar = $element.find('.cd-action-bar');
          $footer.on('inview', function (event, isInView) {
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
