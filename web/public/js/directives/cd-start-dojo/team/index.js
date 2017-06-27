;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadTeam', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/team/',
      bindings : {
        team: '='
      },
      //TODO : dep injection array
      controller: function ($translate, cdDojoService, atomicNotifyService, $scope) {
        var ctrl = this;
        ctrl.$onInit = function () {
          // Ids must be synchronized with Joi payload validation
          ctrl.srcMentors = {
            community: {value: $translate.instant('Youth/community workers')},
            teachers: {value: $translate.instant('Primary or secondary teachers')},
            pro: {value: $translate.instant('IT professionals')},
            students: {value: $translate.instant('3rd level education students')},
            staff: {value: $translate.instant('Staff of venue')},
            youth: {value: $translate.instant('Youth Mentors (under 18)')},
            parents: {value: $translate.instant('Parents of attendees')},
            other: {value: $translate.instant('Other')}
          };
          ctrl.setSrcMentorsValue = function (key) {
            if (!ctrl.team.src[key]) delete ctrl.team.src[key];
          };
          // We don't watch over validity, but over the fact it's touched, so that it refreshes even when the status of validity is the same
          var validityWatcher = $scope.$watchGroup(['$ctrl.teamForm.$pristine', '$ctrl.teamForm.$valid'], function () {
            if (ctrl.team && !ctrl.teamForm.$pristine) ctrl.team.formValidity = ctrl.teamForm.$valid;
          });
          $scope.$on('$destroy', function () {
            validityWatcher();
          });
        };
      }
    });
}());
