;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarPopupItem', {
      bindings: {
        icon: '@',
        title: '@',
        size: '@',
        closeEvent: '@',
        forceFixed: '='
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-popup-item',
      controller: ['$element', '$interval', '$rootScope', function ($element, $interval, $rootScope) {
        var ctrl = this;

        var intervalRef, popupEl, footer;

        function startStopInterval() {
          if (ctrl.showPopup && popupEl && footer) {
            intervalRef = $interval(function () {
              var windowHeight = window.innerHeight;
              var footerHeight = footer[0].offsetHeight;
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
            $interval.cancel(intervalRef);
          }
        }

        ctrl.handleClick = function (e) {
          e.stopPropagation();
          e.preventDefault();
          ctrl.showPopup = !ctrl.showPopup;
          startStopInterval();
        };

        ctrl.$onInit = function () {
          popupEl = $element.find('.cd-action-bar-popup-item__full-width-popup');
          footer = $('#footer');
          $rootScope.$on(ctrl.closeEvent, function () {
            ctrl.showPopup = false;
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
