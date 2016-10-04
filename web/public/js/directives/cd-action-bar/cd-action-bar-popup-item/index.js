;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarPopupItem', {
      bindings: {
        icon: '@',
        title: '@'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-popup-item',
      controller: function () {
        var ctrl = this;

        ctrl.handleClick = function (e) {
          e.stopPropagation();
          e.preventDefault();
          ctrl.showPopup = !ctrl.showPopup;
        }
      },
      transclude: true
    });

}());
