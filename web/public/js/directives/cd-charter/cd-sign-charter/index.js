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

        ctrl.download = function () {
          var pdf = new jsPDF('p', 'pt', 'letter');
          // NOTE: Hey daniel, pdf css !!!1
          pdf.addHTML($('.cd-sad-charter'), function () {
            pdf.save('charter' + ctrl.currentDate + '.pdf');
          });
        };

        ctrl.print = function () {
          // NOTE: Hey daniel, print css !!!1
          $window.print();
        };
      }
    });
}());
