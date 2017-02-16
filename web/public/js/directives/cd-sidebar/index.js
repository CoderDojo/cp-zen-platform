/* global angular */
;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdSidebar', {
      bindings: {
        header: '@',
        tabs: '<',
        baseState: '@'
      },
      restrict: 'E',
      transclude: true,
      templateUrl: '/directives/tpl/cd-sidebar',
      controller: ['$state', '$scope', function ($state, $scope) {
        var ctrl = this;

        ctrl.getUiSrefForTab = function (tab) {
          // Needed to use ui-sref so we can use ui-sref-active
          // ui-sref expects a value of `state-name({param1: 'val1'})`
          // We can use a scope var instead, hence the use of tab.stateParams here
          return tab.state + '(tab.stateParams)';
        };

        ctrl.currentState = $state.current.name;

        $scope.$watch(function () {
          return $state.current.name;
        }, function () {
          ctrl.currentState = $state.current.name;
        });
      }]
    });
}());
