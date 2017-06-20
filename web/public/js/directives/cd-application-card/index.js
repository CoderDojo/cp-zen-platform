;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdApplicationCard', {
      bindings: {
        application: '<',
        user: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card',
      controller: ['cdDojoService', 'dojoUtils', function (cdDojoService, dojoUtils) {
        var ctrl = this;
        var application = ctrl.application;
        var user = ctrl.user;
        var date = ctrl.application.completed ? ctrl.application.updatedAt : ctrl.application.createdAt;
        var dateKey = ctrl.application.completed ? 'Last updated on {{ date }}' : 'Started on {{ date }}';
        cdDojoService.load(ctrl.application.dojo.id)
        .then(function (dojo) {
          ctrl.dojo = dojo;
        });
        cdDojoService.getAvatar(ctrl.application.dojo.id)
        .then(function (avatarUrl) {
          ctrl.dojoImage = avatarUrl;
        });
      }]
    });
}());
