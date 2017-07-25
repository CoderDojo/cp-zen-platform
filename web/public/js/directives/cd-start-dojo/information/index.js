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
      controller: function ($translate, $scope, utilsService, dojoUtils) {
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
          _.extend(ctrl, dojoUtils.getFrequencyStrings());
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
            ctrl.startTime = moment(ctrl.dojo.startTime, 'HH:mm:SS').toDate();
            setterStartTimeWatcher();
          }
        });
        var setterEndTimeWatcher = $scope.$watch('$ctrl.dojo.endTime', function () {
          if (ctrl.dojo && !_.isUndefined(ctrl.dojo.endTime)) {
            ctrl.endTime = moment(ctrl.dojo.endTime, 'HH:mm:SS').toDate();
            setterEndTimeWatcher();
          }
        });
        var startTimeWatcher = $scope.$watch('$ctrl.startTime', function () {
          if (!_.isUndefined(ctrl.startTime)) {
            ctrl.dojo.startTime = moment(ctrl.startTime).format('HH:mm:SS');
          }
        });
        var endTimeWatcher = $scope.$watch('$ctrl.endTime', function () {
          if (!_.isUndefined(ctrl.endTime)) {
            ctrl.dojo.endTime = moment(ctrl.endTime).format('HH:mm:SS');
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
