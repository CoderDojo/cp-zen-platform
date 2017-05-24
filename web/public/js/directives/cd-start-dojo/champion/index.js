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
              {value: 1, legend: 'Poorly'},
              {value: 2},
              {value: 3, legend: 'Fairly'},
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
        };

        ctrl.formatDoB = function () {
          if (ctrl.champion && !_.isDate(ctrl.champion.dob)) ctrl.champion.dob = new Date(ctrl.champion.dob);
        };
        ctrl.isKid = function () {
          if (ctrl.champion && ctrl.champion.form) {
            ctrl.champion.form.isKid = userUtils.getAge(ctrl.champion.dob) <= 18;
          }
        };
        // Because we use 2way binding, onChanges can't be used
        $scope.$watch('$ctrl.champion.dob', function () {
          ctrl.isKid();
          ctrl.formatDoB();
        });
        ctrl.toggle = function () {
          ctrl.picker.opened = !ctrl.picker.opened;
        };
      }
    });
}());
