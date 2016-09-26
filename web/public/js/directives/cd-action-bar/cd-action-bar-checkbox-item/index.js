;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdActionBarCheckboxItem', {
      bindings: {
        model: '<',
        title: '@',
        onChange: '<',
        color: '@'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-action-bar/cd-action-bar-checkbox-item',
      controller: function () {
        var ctrl = this;

        ctrl.handleChange = function (e) {
          e.stopPropagation();
          e.preventDefault();
          ctrl.model = !ctrl.model;
          ctrl.onChange(ctrl.model);
        };
      }
    });

}());
