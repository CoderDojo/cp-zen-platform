;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdStartDojo', {
      restrict: 'EA',
      bindings: {
        currentUser: '='
      },
      templateUrl: '/directives/tpl/cd-start-dojo',
      //TODO : dep injection array
      controller: function ($scope, $translate, usSpinnerService, atomicNotifyService) {
        var ctrl = this;
        usSpinnerService.spin('start-dojo-spinner');
        $scope.tabs = [{
          state: 'start-dojo.champion',
          tabTitle: $translate.instant('Champion Registration')
        },
        {
          state: 'start-dojo.informations',
          tabTitle: $translate.instant('Dojo Informations')
        },
        {
          state: 'start-dojo.venue',
          tabTitle: $translate.instant('Venue Details')
        },
        {
          state: 'start-dojo.team',
          tabTitle: $translate.instant('Gather your Team')
        },
        {
          state: 'start-dojo.charter',
          tabTitle: $translate.instant('Sign the Charter')
        }];

        ctrl.submit = function () {
          cdDojoService.saveDojoLead(ctrl.application)
          .then(function () {
            atomicNotifyService.info($translate.instant('Congratz'));
          });
        };

        ctrl.submitReadonly = function () {
          //_.every(application, 'isValid');
          return true;
        };
        // TODO: redir to proper substate depending on actual dojolead
        usSpinnerService.stop('start-dojo-spinner');
        ctrl.application = {};
        ctrl.application.champion = {};
        ctrl.application.informations = {};
        ctrl.application.venue = {};
        ctrl.application.team = {};
        ctrl.application.charter = {};
        // cdDojoService.searchDojoLead({userId: ctrl.currentUser})
        // .then(function (application) {
        //   ctrl.application = ctrl.application;
        // })
      }
    });
}());
