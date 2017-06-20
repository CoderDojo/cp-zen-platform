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
        ctrl.steps = {
          champion: {
            state: 'start-dojo.champion',
            name: $translate.instant('Champion Registration')
          },
          dojo: {
            state: 'start-dojo.information',
            name: $translate.instant('Dojo Information')
          },
          venue: {
            state: 'start-dojo.venue',
            name: $translate.instant('Venue Details')
          },
          team: {
            state: 'start-dojo.team',
            name: $translate.instant('Gather your Team')
          },
          charter: {
            state: 'start-dojo.charter',
            name: $translate.instant('Sign the Charter')
          }
        };
      }
    });
}());
