;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadCharter', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/charter/',
      //TODO : dep injection array
      bindings : {
        charter: '='
      },
      controller: function ($scope, $translate) {
        var ctrl = this;
        ctrl.isValid = function () {
          return ctrl.charter ? ctrl.charter.isValid : false;
        };
      }
    });
}());
