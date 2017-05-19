;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadReview', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/review/',
      bindings : {
        application: '='
      },
      //TODO : dep injection array
      controller: function ($scope, $translate) {
        var ctrl = this;
        ctrl.$onChanges = function () {
          if (ctrl.application && ctrl.application.champion) {
            ctrl.validity = ctrl.application.champion.form ? ctrl.application.champion.form.$valid : ctrl.application.champion.isValid;
          }
        };
      }
    });
}());
