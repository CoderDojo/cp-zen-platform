;(function() {
  'use strict';
  /*global CKEDITOR*/
angular
    .module('cpZenPlatform')
    .component('cdSadInformation', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/information/',
      bindings : {
        dojo: '='
      },
      // TODO : dep injection array
      controller: function ($translate, $scope, utilsService) {
        var ctrl = this;
        ctrl.$onInit = function () {
          var initialDate = new Date();
          ctrl.firstDateOptions = {
            formatYear: 'yyyy',
            startingDay: 1,
            datepickerMode: 'day',
            initDate: initialDate
          };
          ctrl.picker = {opened: false};
          ctrl.frequencies = [
            { id: '2/w',
            name: $translate.instant('Twice Weekly')},
            { id: '1/w',
            name: $translate.instant('Weekly')},
            { id: '2/m',
            name: $translate.instant('Bi-weekly/Fortnightly/Every two weeks')},
            { id: '1/m',
            name: $translate.instant('Monthly')},
            { id: 'other',
            name: $translate.instant('Other')}
          ];
          ctrl.monthlyFrequencies = [
            {id: 'first', name: $translate.instant('First')},
            {id: '2nd', name: $translate.instant('Second')},
            {id: '3rd', name: $translate.instant('Third')},
            {id: 'last', name: $translate.instant('Last')}
          ];
          // ISO 8601 based, no Sunday as 1
          // We don't use moment data because we want to handle more than the locale,
          // and that would force us to preload the data for day/dates/etc, meaning 2 different processes for the same thing
          ctrl.days = [
            {id: 1, name: $translate.instant('Monday')},
            {id: 2, name: $translate.instant('Tuesday')},
            {id: 3, name: $translate.instant('Wednesday')},
            {id: 4, name: $translate.instant('Thursday')},
            {id: 5, name: $translate.instant('Friday')},
            {id: 6, name: $translate.instant('Saturday')},
            {id: 7, name: $translate.instant('Sunday')}
          ];
          ctrl.initContent = "<p>" +
            $translate.instant('Suggested Notes:') + "<br><br>" + $translate.instant('Please bring:') +
            "<ul><li>" + $translate.instant('A laptop. Borrow one from somebody if needs be.') + "</li>" +
            "<li><b>" + $translate.instant('A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.') + "</b></li>" +
            "</ul></p>";
          ctrl.isMeridian = false;
          var language = ($translate.use() || $translate.storage.get($translate.storageKey()));
          var locale = moment.localeData(language);
          if (locale) {
            // Check if meridian is supported
            if (locale.longDateFormat('LT').toLowerCase().indexOf('a') > -1) ctrl.isMeridian = true;
            // Check if hebrew Calendar, hence switch days order while keeping ids
            if (locale.firstDayOfWeek() === 1 && locale.firstDayOfYear() === 4) ctrl.days.unshift(ctrl.days.pop());
          }
          ctrl.editorOptions = utilsService.getCKEditorConfig();
        };
        var dateWatcher = $scope.$watch('$ctrl.dojo.firstSession', function () {
          ctrl.formatFirstSessionDate();
        });
        var setterStartTimeWatcher = $scope.$watch('$ctrl.dojo.startTime', function () {
          if (ctrl.dojo && !_.isUndefined(ctrl.dojo.startTime)) {
            ctrl.startTime = moment(ctrl.dojo.startTime, 'HH:mm:SSZZ').toDate();
            setterStartTimeWatcher();
          }
        });
        var setterEndTimeWatcher = $scope.$watch('$ctrl.dojo.endTime', function () {
          if (ctrl.dojo && !_.isUndefined(ctrl.dojo.endTime)) {
            ctrl.endTime = moment(ctrl.dojo.endTime, 'HH:mm:SSZZ').toDate();
            setterEndTimeWatcher();
          }
        });
        var startTimeWatcher = $scope.$watch('$ctrl.startTime', function () {
          if (!_.isUndefined(ctrl.startTime)) {
            ctrl.dojo.startTime = moment(ctrl.startTime).utc().format('HH:mm:SSZZ');
          }
        });
        var endTimeWatcher = $scope.$watch('$ctrl.endTime', function () {
          if (!_.isUndefined(ctrl.endTime)) {
            ctrl.dojo.endTime = moment(ctrl.endTime).utc().format('HH:mm:SSZZ');
          }
        });
        var notesWatcher = $scope.$watch('$ctrl.dojo.notes', function () {
          if (ctrl.dojo && (ctrl.dojo.notes === '' || ctrl.dojo.notes === '<p></p>')) {
            ctrl.dojo.notes = ctrl.initContent;
            // ckEditor doens't refresh if we set the content post-init
            CKEDITOR.instances.dojoNotes.setData(ctrl.initContent);
            notesWatcher();
          }
        });
        ctrl.formatFirstSessionDate = function () {
          if (ctrl.dojo && ctrl.dojo.firstSession && !_.isDate(ctrl.dojo.firstSession)) {
            ctrl.dojo.firstSession = new Date(ctrl.dojo.firstSession);
          }
        };
        ctrl.toggle = function () {
          ctrl.picker.opened = !ctrl.picker.opened;
        };
        ctrl.requestEmail = function () {
          ctrl.dojo.requestEmail = true;
          delete ctrl.dojo.email;
          ctrl.dojoForm.email.$setPristine();
        };
        ctrl.setEmail = function () {
          delete ctrl.dojo.requestEmail;
        };
        // We don't watch over validity, but over the fact it's touched, so that it refreshes even when the status of validity is the same
        var validityWatcher = $scope.$watchGroup(['$ctrl.dojoForm.$pristine', '$ctrl.dojoForm.$valid'], function () {
          if (ctrl.dojo && !ctrl.dojoForm.$pristine) ctrl.dojo.formValidity = ctrl.dojoForm.$valid;
        });
        $scope.$on('$destroy', function () {
          validityWatcher();
          notesWatcher();
          dateWatcher();
          startTimeWatcher();
          endTimeWatcher();
        });
      }
    });
}());
