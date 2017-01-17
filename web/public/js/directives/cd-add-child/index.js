;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .component('cdAddChild', {
      bindings: {
        parentProfileData: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-add-child',
      controller: ['$translate', '$state', 'cdUsersService', 'alertService', 'userUtils', function ($translate, $state, cdUsersService, alertService, userUtils) {
        var ctrl = this;

        ctrl.save = function () {
          ctrl.profile.userTypes = [userUtils.getBaseUserTypeByAge(ctrl.profile.dateOfBirth)];
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
          cdUsersService.saveYouthProfilePromise(_.defaults(ctrl.profile, _.pick(ctrl.parentProfileData.data, fieldsToCopy)))
            .then(function (resp) {
              if (resp.data && resp.data.error) {
                alertService.showError($translate.instant(resp.data.error));
              } else {
                if (resp.data && resp.data.userId) {
                  $state.go('my-children.child', {id: resp.data.userId});
                }
              }
            })
        };

        ctrl.$onInit = function () {
          ctrl.profile = {};
          var thirteenYearsAgo = new Date();
          thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear()-13);
          ctrl.thirteenYearsAgo = thirteenYearsAgo;
          ctrl.dobDateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            'datepicker-mode': "'year'",
            initDate: thirteenYearsAgo,
            datepickerMode: 'year'
          };
        };
      }]
    });
}());
