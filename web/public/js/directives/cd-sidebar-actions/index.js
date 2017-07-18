;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdSidebarActions', {
      bindings: {
        save: '=',
        saveVisible: '=',
        submit: '<',
        submitVisible: '='
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-sidebar-actions'
    });
}());
