/* global angular */
;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdSidebar', {
      bindings: {
        header: '@',
        tabs: '<',
        tabHeader: '<',
        baseState: '@',
        actions: '<',
        viewData: '=',
        baseStateMenu: '<?'
      },
      restrict: 'E',
      transclude: {
        'actions': '?cdSidebarActions'
      },
      templateUrl: '/directives/tpl/cd-sidebar',
      controller: ['$state', '$scope', '$window', function ($state, $scope, $window) {
        var ctrl = this;

        ctrl.$onInit = function () {
          ctrl.currentState = $state.current.name;
          ctrl.deployableMenu = $window.innerWidth <= 768;
        };
        ctrl.getUiSrefForTab = function (tab) {
          // Needed to use ui-sref so we can use ui-sref-active
          // ui-sref expects a value of `state-name({param1: 'val1'})`
          // We can use a scope var instead, hence the use of tab.stateParams here
          return tab.state + '(tab.stateParams)';
        };


        $scope.$watch(function () {
          return $state.current.name;
        }, function () {
          ctrl.currentState = $state.current.name;
          ctrl.isBaseState = ctrl.baseState === ctrl.currentState;
          ctrl.baseStateMenu = !ctrl.baseStateMenu && ctrl.isBaseState;
          ctrl.listVisible = $window.innerWidth <= 768 ? ctrl.isBaseState : true;
        });
      }]
    });
}());
