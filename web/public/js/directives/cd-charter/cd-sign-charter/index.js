;(function() {
  'use strict';
  /* global jsPDF */
angular
    .module('cpZenPlatform')
    .component('cdSignCharter', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-charter/cd-sign-charter/',
      bindings: {
        ngModel: '=',
        accept: '=',
        isValid: '='
      },
      //TODO : dep injection array
      controller: function (cdAgreementsService, $window) {
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.currentDate = new Date();
        };

        ctrl.print = function () {
          // NOTE: Hey daniel, print css !!!1
          $window.print();
        };
      }
    });
}());
