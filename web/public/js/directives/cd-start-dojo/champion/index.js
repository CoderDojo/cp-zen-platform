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
      // TODO : dep injection array
      controller: function (userUtils, $state, cdDojoService, $translate, $scope) {
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
              {value: 1, legend: 'Not very'},
              {value: 2},
              {value: 3, legend: 'Moderatly'},
              {value: 4},
              {value: 5, legend: 'Very'}
            ]
          };
          // TODO : cd-cdf
          ctrl.sources = [
            { id: 'search_engine',
              name: $translate.instant('Search Engine')},
            { id: 'volunteers',
              name: $translate.instant('Other CoderDojo Volunteers')},
            { id: 'organisations',
              name: $translate.instant('Other Coding Organisations')},
            { id: 'developpers',
              name: $translate.instant('Development Community')},
            { id: 'events',
              name: $translate.instant('Events')},
            { id: 'word_of_mouth',
              name: $translate.instant('Word of Mouth')},
            { id: 'family',
              name: $translate.instant('Family/Friends')},
            { id: 'media',
              name: $translate.instant('Media (newspaper/radio)')},
            { id: 'other',
              name: $translate.instant('Other')}
          ];
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
        });
      }
    });
}());
