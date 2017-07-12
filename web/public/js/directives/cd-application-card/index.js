;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdApplicationCard', {
      bindings: {
        lead: '<',
        user: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-application-card',
      controller: ['cdDojoService', 'dojoUtils', '$q', 'intercomService',
      function (cdDojoService, dojoUtils, $q, intercomService) {
        var ctrl = this;
        ctrl.application = ctrl.lead.application;
        ctrl.date = ctrl.lead.completed ? ctrl.lead.updatedAt : ctrl.lead.createdAt;
        ctrl.dateKey = ctrl.lead.completed ? 'Last updated on {{ date }}' : 'Started on {{ date }}';
        ctrl.timesUp = moment(ctrl.date).diff(moment(), 'days') > 2;
        ctrl.$onInit = function () {
          if (ctrl.application.dojo) {
            return $q.all((function () {
              cdDojoService.load(ctrl.application.dojo.id)
              .then(function (res) {
                ctrl.dojo = res.data;
              });
            }()),
            (function () {
              cdDojoService.getAvatar(ctrl.application.dojo.id)
              .then(function (avatarUrl) {
                ctrl.dojoImage = avatarUrl;
              });
            }()));
          }
        };
        ctrl.openIntercom = intercomService.InitIntercom;
      }]
    });
}());
