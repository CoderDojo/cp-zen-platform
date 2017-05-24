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
                    delete ctrl.save;
                    ctrl.agreement = agreement.data;
                  } else {
                    ctrl.agreement = {};
                  }
                });
              } else { // User is logged out
                delete ctrl.save;
              }
            })
            .catch(function () {
              delete ctrl.save;
            });
          });
        };
        ctrl.save = function () {
          cdAgreementsService.save(ctrl.agreement)
          .then(function () {
            // NOTE: @rosa have a look plz
            atomicNotifyService.success($translate.instant('Thanks for agreeing to this charter!'));
            // TODO: redirect?
          });
        };
        ctrl.isValid = function () {
          return ctrl.user ? (ctrl.agreement ? true: false) : true;
        };
      }]
    });
}());
