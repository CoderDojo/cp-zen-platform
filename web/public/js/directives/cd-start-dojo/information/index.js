;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadInformation', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/information/',
      bindings : {
        dojo: '=',
        displayOnly: '<'
      },
      //TODO : dep injection array
      controller: function ($translate) {
        var ctrl = this;
        var initialDate = new Date();
        ctrl.firstDateOptions = {
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
        ctrl.toggle = function () {
          ctrl.picker.opened = !ctrl.picker.opened;
        };
        ctrl.requestEmail = function () {
          ctrl.dojo.requestEmail = true;
          delete ctrl.dojo.email;
          ctrl.dojo.form.email.$setPristine();
        };
        ctrl.setEmail = function () {
          delete ctrl.dojo.requestEmail;
        };
      }
    });
}());
