;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdCharterContent', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-charter/content/',
      //TODO : dep injection array
      controller: function ($scope, $translate) {

      }
    });
}());
