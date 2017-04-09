;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadTeam', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/team/',
      bindings : {
        team: '=',
        tabHeader: '=',
        displayOnly: '<'
      },
      //TODO : dep injection array
      controller: function ($scope, $translate) {
        var ctrl = this;
        ctrl.emailPlaceholder = "myfriend@example.com\nmyotherfriend@example.com";
      }
    });
}());
