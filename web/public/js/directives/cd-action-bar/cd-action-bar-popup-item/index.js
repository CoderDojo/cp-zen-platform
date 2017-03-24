;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarPopupItem', {
      bindings: {
        icon: '@',
        actionTitle: '@',
        size: '@',
        closeEvent: '@',
        openAction: '&',
        forceFixed: '=',
        showPopup: '=?'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-popup-item',
      controller: ['$element', '$interval', '$rootScope', function ($element, $interval, $rootScope) {
        var ctrl = this;

        var intervalRef, popupEl, footer;

        function startStopInterval () {
          if (ctrl.showPopup && popupEl && footer) {
            intervalRef = $interval(function () {
              var windowHeight = window.innerHeight;
              var gapUnderFooter = windowHeight - footer[0].getBoundingClientRect().bottom;
              gapUnderFooter = gapUnderFooter > 0 ? gapUnderFooter : 0; // either positive value, or zero.
              var footerHeight = footer[0].offsetHeight + gapUnderFooter;
              var popupHeight = popupEl[0].offsetHeight;
              popupHeight = popupHeight === 0 && popupEl[1] ? popupEl[1].offsetHeight : popupHeight;

              if (ctrl.forceFixed === false && windowHeight < footerHeight + popupHeight) {
                popupEl.css({
                  overflow: 'auto'
                });
                ctrl.forceFixed = true;
              } else if (ctrl.forceFixed === true && windowHeight >= footerHeight + popupHeight) {
                popupEl.css({
                  overflow: 'visible'
                });
                ctrl.forceFixed = false;
              }
            }, 500);
          } else if (intervalRef) {
            ctrl.forceFixed = false;
            $interval.cancel(intervalRef);
          }
        }

        ctrl.handleClick = function (e) {
          e.stopPropagation();
          e.preventDefault();
          ctrl.showPopup = !ctrl.showPopup;
          if (ctrl.showPopup) ctrl.openAction();
          startStopInterval();
        };

        ctrl.applyShortcut = function ($event) {
          if ($event.keyCode === 27) ctrl.handleClick();
        };

        ctrl.$onInit = function () {
          console.log(ctrl, ctrl.showPopup);
          popupEl = $element.find('.cd-action-bar-popup-item__full-width-popup');
          footer = $('#footer');
          $element.on('keydown', ctrl.applyShortcut);
          $rootScope.$on(ctrl.closeEvent, function (event) {
            // Because we transclude twice, we cannot use the toggling function "handleClick"
            // instead we force values
            ctrl.showPopup = false;
            ctrl.forceFixed = false;
            $interval.cancel(intervalRef);
          });
        };

        ctrl.$onDestroy = function () {
          if (intervalRef) {
            $interval.cancel(intervalRef);
          }
        };
      }],
      transclude: true
    });

}());
