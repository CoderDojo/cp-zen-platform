;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdApplicationCardStatus', {
      bindings: {
        id: '<leadId',
        date: '<',
        completed : '<',
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-application-card/status',
    });
}());
