;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadChampion', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/champion/',
      bindings: {
        champion: '='
      },
      controller: ['userUtils', '$state', 'cdDojoService', '$translate', '$scope', '$timeout', 'dojoUtils',
      function (userUtils, $state, cdDojoService, $translate, $scope, $timeout, dojoUtils) {
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.dateFormat = 'dd-MMMM-yyyy';
          ctrl.dobDateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            datepickerMode: 'year'
          };
          ctrl.picker = {opened: false};
          ctrl.sliderOptions = {
            showSelectionBar: true,
            showTicksValues: true,
            stepsArray: [
              {value: 1, legend: $translate.instant('Not very')},
              {value: 2},
              {value: 3, legend: $translate.instant('Slightly')},
              {value: 4},
              {value: 5, legend: $translate.instant('Very')}
            ]
          };
          ctrl.sources = dojoUtils.startingDojoSrcs;
          ctrl.isKid = false;
        };

        ctrl.formatDoB = function () {
          if (ctrl.champion && !_.isDate(ctrl.champion.dob)) ctrl.champion.dob = new Date(ctrl.champion.dob);
        };
        ctrl.getAge = function () {
          var isKid = false;
          if (ctrl.champion && ctrl.champion.dob) {
            ctrl.isKid = isKid = userUtils.getAge(ctrl.champion.dob) <= 18;
          }
          return isKid;
        };
        // Because we use 2way binding, onChanges can't be used
        var dobWatcher = $scope.$watch('$ctrl.champion.dob', function () {
          ctrl.getAge();
          ctrl.formatDoB();
        }, true);

        var phoneWatcher = $scope.$watch('$ctrl.champion.phone', function () {
          if (ctrl.champion && ctrl.champion.phone) {
            $timeout(function () {
              // Force reload of value with async loading of data
              var element = $('input[name="phone"]');
              if (element && ctrl.championForm && ctrl.championForm.phone) {
                element.intlTelInput('setNumber', ctrl.champion.phone);
                ctrl.championForm.phone.$setViewValue(element.val());
                ctrl.championForm.phone.$commitViewValue();
                ctrl.championForm.phone.$validate();
              }
            });
            phoneWatcher();
          }
        });
        ctrl.toggle = function () {
          ctrl.picker.opened = !ctrl.picker.opened;
        };
        ctrl.setValidity = function () {
          if (ctrl.champion) ctrl.champion.formValidity = ctrl.championForm.$valid;
        };
        // We don't watch over validity, but over the fact it's touched, so that it refreshes even when the status of validity is the same
        var validityWatcher = $scope.$watchGroup(['$ctrl.championForm.$pristine', '$ctrl.championForm.$valid'], function () {
          if (ctrl.championForm && !ctrl.championForm.$pristine) {
            ctrl.setValidity();
          }
        });
        $scope.$on('$destroy', function () {
          validityWatcher();
          dobWatcher();
          phoneWatcher();
        });
      }
    ]});
}());
