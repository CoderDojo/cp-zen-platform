;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSignCharter', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/sign-charter/',
      bindings: {
        ngModel: '=',
        accept: '='
      },
      //TODO : dep injection array
      controller: function (cdAgreementsService, $window) {
        var ctrl = this;
        ctrl.ngModel.version = 2;
        ctrl.currentDate = new Date();

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
