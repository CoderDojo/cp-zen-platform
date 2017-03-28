;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadInformations', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/informations/',
      //TODO : dep injection array
      controller: function ($scope, $translate) {

      }
    });
}());
