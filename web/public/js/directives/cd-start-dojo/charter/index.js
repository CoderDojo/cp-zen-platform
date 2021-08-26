;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadCharter', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/charter/',
      bindings : {
        charter: '='
      },
      controller: ['$scope', '$translate', function ($scope, $translate) {
        var ctrl = this;
        ctrl.isValid = function () {
          return ctrl.charter ? ctrl.charter.isValid : false;
        };
        ctrl.setValidity = function () {
          if (ctrl.charter) ctrl.charter.formValidity = ctrl.charterForm.$valid;
        };
        // We don't watch over validity, but over the fact it's touched, so that it refreshes even when the status of validity is the same
        var validityWatcher = $scope.$watchGroup(['$ctrl.charterForm.$pristine', '$ctrl.charterForm.$valid'], function () {
          if (ctrl.charterForm && !ctrl.charterForm.$pristine) {
            ctrl.setValidity();
          }
        });
        $scope.$on('$destroy', function () {
          validityWatcher();
        });
      }]
    });
}());
