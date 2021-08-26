;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdSidebarActions', {
      bindings: {
        save: '=',
        saveVisible: '=',
        saveDisabled: '=',
        submit: '<',
        submitVisible: '='
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-sidebar-actions'
    });
}());
