;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadInformation', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/information/',
      bindings : {
        information: '=',
        tabHeader: '=',
        displayOnly: '<'
      },
      //TODO : dep injection array
      controller: function ($scope, $translate) {
        var ctrl = this;
        var initialDate = new Date();
        initialDate.setFullYear(initialDate.getFullYear() - 18);
        ctrl.dobDateOptions = {
          formatYear: 'yyyy',
          startingDay: 1,
          datepickerMode: 'year',
          initDate: initialDate
        };
        ctrl.picker = {opened: false};
        ctrl.options = [
          { id: '',
            name: $translate.instant('Twice Weekly')},
          { id: '',
            name: $translate.instant('Weekly')},
          { id: '',
            name: $translate.instant('Bi-weekly/Fortnightly/Every two weeks')},
          { id: '',
            name: $translate.instant('Monthly')},
          { id: '',
            name: $translate.instant('Other (please detail)')}
        ];
      }
    });
}());
