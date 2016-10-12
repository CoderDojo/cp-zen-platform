;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdAwardBadge', {
      bindings: {
        user: '<'
      },
      controller: ['cdBadgesService', 'usSpinnerService', '$translate', 'alertService', '$rootScope', function (cdBadgesService, usSpinnerService, $translate, alertService, $rootScope) {
        var ctrl = this;
        ctrl.evidence = '';

        ctrl.badgeSelection = ctrl.badgeSelection || {};

        cdBadgesService.listBadges(function (response) {
          ctrl.badges = response.badges;
        });

        function awardBadgeEnabled () {
          return !!ctrl.selectedBadge && ctrl.evidence.trim() !== '';
        }

        ctrl.evidenceChanged = ctrl.badgeSelected = function () {
          ctrl.awardBadgeButtonEnabled = awardBadgeEnabled();
        };

        ctrl.awardBadge = function (selectedBadge) {
          usSpinnerService.spin('manage-dojo-users-spinner');
          var applicationData = {
            user: ctrl.user,
            badge: ctrl.selectedBadge,
            emailSubject: 'You have been awarded a new CoderDojo digital badge!',
            evidence: ctrl.evidence
          };

          cdBadgesService.sendBadgeApplication(applicationData, function (response) {
            usSpinnerService.stop('manage-dojo-users-spinner');
            if(response.error) return alertService.showError($translate.instant(response.error));
            ctrl.evidence = '';
            ctrl.selectedBadge = '';
            ctrl.awardBadgeButtonEnabled = false;
            alertService.showAlert($translate.instant('Badge Awarded!'));
            $rootScope.$emit('badgeAwarded');
          });
        };
      }],
      templateUrl: '/directives/tpl/cd-award-badge'
    });
}());
