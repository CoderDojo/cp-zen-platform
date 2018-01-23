/* global angular, _ */
;(function () {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdAddChild', {
      bindings: {
        parentProfileData: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-add-child',
      controller: ['$translate', '$state', 'cdUsersService', 'alertService', 'userUtils', 'utilsService', function ($translate, $state, cdUsersService, alertService, userUtils, utilsService) {
        var ctrl = this;

        ctrl.save = function () {
          ctrl.profile.userTypes = [userUtils.getBaseUserTypeByAge(ctrl.profile.dob)];
          var fieldsToCopy = [
            'admin1Code',
            'admin1Name',
            'admin2Code',
            'admin2Name',
            'admin3Code',
            'admin3Name',
            'admin4Code',
            'admin4Name',
            'alpha2',
            'alpha3',
            'city',
            'continent',
            'country',
            'county',
            'place',
            'placeGeonameId',
            'placeName',
            'state'
          ];
          cdUsersService.saveYouthProfile(_.defaults(ctrl.profile, _.pick(ctrl.parentProfileData.data, fieldsToCopy)))
            .then(function (resp) {
              if (resp.data && resp.data.error) {
                var reason;
                if (resp.data.error === 'email-exists') {
                  reason = $translate.instant('Email is already associated with an account. Use a new email or leave it blank.');
                }
                alertService.showError(reason || $translate.instant(resp.data.error));
              } else {
                if (resp.data && resp.data.userId) {
                  $state.go('my-children.child', {id: resp.data.userId});
                }
              }
            });
        };

        ctrl.passwordValidator = function () {
          var validationResult = utilsService.validatePassword(ctrl.profile.password, ctrl.profile.email);
          if (!validationResult.valid) ctrl.invalidPasswordMessage = $translate.instant(validationResult.msg);
          return validationResult.valid;
        };

        ctrl.emailValidator = function () {
          return !(!ctrl.profile.email && ctrl.profile.password);
        };

        ctrl.$onInit = function () {
          ctrl.profile = {};
          var thirteenYearsAgo = new Date();
          thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
          ctrl.thirteenYearsAgo = thirteenYearsAgo;
          ctrl.dobDateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            initDate: thirteenYearsAgo,
            datepickerMode: 'year'
          };
        };
      }]
    });
}());
