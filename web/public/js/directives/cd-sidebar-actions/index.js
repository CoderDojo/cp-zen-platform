;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdSidebarActions', {
      bindings: {
        save: '=',
        saveVisible: '=',
        submit: '<',
        submitReadonly: '='
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-sidebar-actions',
      controller: ['$state', '$scope', function ($state, $scope) {
        var ctrl = this;

      }]
    });
}());
