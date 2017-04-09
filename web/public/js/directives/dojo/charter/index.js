;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdCharter', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/charter/',
      //TODO : dep injection array
      controller: function ($scope, $translate) {

      }
    });
}());
