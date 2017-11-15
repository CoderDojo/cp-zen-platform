;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdApplicationCardStatus', {
      bindings: {
        id: '<leadId',
        date: '<',
        completed : '<',
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-application-card/status',
      controller: ['intercomService', function (intercomService) {
        var ctrl = this;
        ctrl.dateKey = ctrl.completed ? 'Last updated on {{ date }}' : 'Started on {{ date }}';
        ctrl.timesUp = moment(ctrl.date).diff(moment(), 'days') > 2;
        ctrl.openIntercom = intercomService.InitIntercom;
      }]
    });
}());
