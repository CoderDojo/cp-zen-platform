;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadChampion', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/champion/',
      bindings: {
        champion: '=',
        displayOnly: '<'
      },
      // TODO : dep injection array
      controller: function (userUtils, $state, cdDojoService, $translate, $scope) {
        var ctrl = this;

        var initialDate = new Date();
        initialDate.setFullYear(initialDate.getFullYear() - 18);
        ctrl.dobDateOptions = {
          formatYear: 'yyyy',
          startingDay: 1,
          initDate: initialDate,
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
        // We wait for parent to sync before doing our init
        // var initWatcher = $scope.$watch('$ctrl.champion', function (newChampion) {
        //   if (newChampion && !ctrl.champion) {
        //     usSpinnerService.stop('');
        //     initWatcher();
        //   }
        // });

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
        ctrl.toggle = function () {
          ctrl.picker.opened = !ctrl.picker.opened;
        };

        ctrl.isKid = function () {
          ctrl.form.isKid = userUtils.getAge(ctrl.champion.dob) <= 18;
        };

        ctrl.dateFormat = 'dd-MMMM-yyyy';
      }
    });
}());
