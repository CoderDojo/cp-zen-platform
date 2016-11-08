;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarCheckboxItem', {
      bindings: {
        model: '<',
        actionTitle: '@',
        onChange: '<',
        color: '@'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-checkbox-item',
      controller: function () {
        var ctrl = this;

        ctrl.handleChange = function (e) {
          ctrl.onChange(ctrl.model);
        };

      }
    });

}());
