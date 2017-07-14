(function() {
  'use strict';

  angular.module('cpZenPlatform').component('cdExpandingCard', {
    bindings: {
        roundImage: '@',
        roundImageFallback: '@',
        mainTitle: '@',
        subTitle1: '@',
        subTitle2: '@',
        startExpanded: '@'
    },
    transclude: {
      icon: '?expandingCardIcon'
    },
    templateUrl: '/directives/tpl/cd-expanding-card',
    controller: function ($timeout, $element) {
      var ctrl = this;
      var content = $element.find('.cd-expanding-card__card-content');
      var contentWrapper = $element.find('.cd-expanding-card__card-content-size-wrapper');
      if (ctrl.startExpanded === 'true') {
        ctrl.expanded = 'expanded';
        content.css('height', 'auto');
      } else {
        ctrl.expanded = 'collapsed';
      }

      ctrl.expand = function (e) {
        if (ctrl.expanded === 'collapsed' || ctrl.expanded === 'collapsing') {
          ctrl.expanded = 'expanding';
          content.css('height', contentWrapper.outerHeight() + 'px');
          $timeout(function () {
            content.css('height', 'auto');
            ctrl.expanded = 'expanded';
          }, 300);
        }
      };

      ctrl.collapse = function (e) {
        if (ctrl.expanded === 'expanded' || ctrl.expanded === 'expanding') {
          e.stopPropagation();
          content.css('height', contentWrapper.outerHeight() + 'px');
          requestAnimationFrame(function () {
            ctrl.expanded = 'collapsing';
            content.css('height', 0);
            $timeout(function () {
              ctrl.expanded = 'collapsed';
            }, 300);
          });
        }
      };
    }
  });
})();
