(function() {
  'use strict';

  angular.module('cpZenPlatform').component('cdExpandingCard', {
    transclude: true,
    bindings: {
        heroImage: '@',
        roundImage: '@',
        mainTitle: '@',
        subTitle1: '@',
        subTitle2: '@'
    },
    templateUrl: '/directives/tpl/cd-expanding-card',
    controller: function ($timeout, $element) {
      var ctrl = this;
      var content = $element.find('.cd-expanding-card__card-content');
      var contentWrapper = $element.find('.cd-expanding-card__card-content-size-wrapper');
      ctrl.expanded = 'collapsed';

      ctrl.expand = function (e, force) {
        e.stopPropagation();
        if (ctrl.expanded === 'collapsed' || ctrl.expanded === 'collapsing') {
          ctrl.expanded = 'expanding';
          //content.css('height', 'auto');
          content.css('height', contentWrapper.outerHeight() + 'px');
          $timeout(function () {
            ctrl.expanded = 'expanded';
          }, 300);
        } else if (force) {
          ctrl.expanded = 'collapsing';
          content.css('height', 0);
          $timeout(function () {
            ctrl.expanded = 'collapsed';
          }, 300);
        }
      };
    }
  });
})();
