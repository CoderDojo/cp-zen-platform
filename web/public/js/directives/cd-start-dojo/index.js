;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdStartDojo', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo',
      //TODO : dep injection array
      controller: function ($scope, $translate, usSpinnerService) {
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

        // TODO: redir to proper substate depending on actual dojolead
        usSpinnerService.stop('start-dojo-spinner');
      }
    });
}());
