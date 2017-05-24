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
            datepickerMode: 'year',
            initDate: initialDate
          };
          ctrl.picker = {opened: false};
          ctrl.options = [
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
          ctrl.initContent = "<p>" +
            $translate.instant('Suggested Notes:') + "<br><br>" + $translate.instant('Please bring:') +
            "<ul><li>" + $translate.instant('A laptop. Borrow one from somebody if needs be.') + "</li>" +
            "<li><b>" + $translate.instant('A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.') + "</b></li>" +
            "</ul></p>";


          ctrl.editorOptions = utilsService.getCKEditorConfig();
        };
        var dateWatcher = $scope.$watch('$ctrl.dojo.firstSession', function () {
          ctrl.formatFirstSessionDate();
        });
        var notesWatcher = $scope.$watch('$ctrl.dojo.notes', function () {
          if (ctrl.dojo.notes === '' || ctrl.dojo.notes === '<p></p>') {
            ctrl.dojo.notes = ctrl.initContent;
            // ckEditor doens't refresh if we set the content post-init
            CKEDITOR.instances['dojoNotes'].setData(ctrl.initContent);
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
          ctrl.dojo.form.email.$setPristine();
        };
        ctrl.setEmail = function () {
          delete ctrl.dojo.requestEmail;
        };

        $scope.$on('$destroy', function () {
          notesWatcher();
          dateWatcher();
        });
      }
    });
}());
