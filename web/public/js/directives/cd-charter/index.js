/* global angular */
;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdCharter', {
      bindings: {
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-charter',
      controller: ['cdAgreementsService', 'auth', 'atomicNotifyService', '$translate',
      function (cdAgreementsService, auth, atomicNotifyService, $translate) {
        var ctrl = this;
        ctrl.$onInit = function () {
          cdAgreementsService.getCurrentCharterVersion()
          .then(function (response) {
            ctrl.version = response.data.version;
            ctrl.user = {};
            auth.instance()
            .then(function (response) {
              if (response.data.ok && !_.isEmpty(response.data.user)) {
                ctrl.user = response.data;
                cdAgreementsService.loadUserAgreement(ctrl.version, ctrl.user.user.id)
                .then(function (agreement) {
                  if (agreement.data && !_.isEmpty(agreement.data)) {
                    // We remove the faculty to save to signal sign-charter that it's a valid chart
                    ctrl.agreement = agreement.data;
                  } else {
                    ctrl.agreement = {};
                  }
                });
              }
            });
          });
        };
        ctrl.save = function () {
          cdAgreementsService.save(ctrl.agreement)
          .then(function (agreement) {
            ctrl.agreement = agreement;
            // NOTE: @rosa have a look plz
            atomicNotifyService.success($translate.instant('Thanks for agreeing to our charter!'));
            // TODO: redirect?
          });
        };
        ctrl.isValid = function () {
          return !_.isEmpty(ctrl.user) ? (!_.isEmpty(ctrl.agreement) && ctrl.agreement.id) : true;
        };
      }]
    });
}());
