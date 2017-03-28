;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadTeam', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/team/',
      //TODO : dep injection array
      controller: function ($scope, $translate) {

      }
    });
}());
