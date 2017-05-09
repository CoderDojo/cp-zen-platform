;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadTeam', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/team/',
      bindings : {
        team: '=',
        dojo: '=',
        displayOnly: '<'
      },
      //TODO : dep injection array
      controller: function ($translate, cdDojoService, atomicNotifyService) {
        var ctrl = this;
        ctrl.$onInit = function () {
          var now = new Date();
          ctrl.canSendEmail = (ctrl.dojo.form.$valid || ctrl.dojo.isValid) && !ctrl.dojo.emailRequired;
          ctrl.emailPlaceholder = 'myfriend@example.com\nmyotherfriend@example.com';
          ctrl.inviteTeam = function () {
            ctrl.team.team[now] = ctrl.team.temp.teamMembers;
            cdDojoService.sendTeamInvitation(ctrl.team.team[now])
            .then(function () {
              atomicNotifyService.info($translate('Invitation sent to %1s team members'));
            });
          };
          ctrl.inviteMembers = function () {
            ctrl.team.invited[now] = ctrl.team.temp.invitedMembers;
            cdDojoService.sendDojoUserInvitation(ctrl.team.invited[now])
            .then(function () {
              atomicNotifyService.info($translate('Invitation sent to %1s team members'));
            });
          };
        }
      }
    });
}());
