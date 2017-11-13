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
      controller: ['cdDojoService', 'dojoUtils', '$q',
      function (cdDojoService, dojoUtils, $q) {
        var ctrl = this;
        ctrl.application = ctrl.lead.application;
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
      }]
    });
}());
