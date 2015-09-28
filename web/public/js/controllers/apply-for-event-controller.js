(function () {
  'use strict';

  function cdApplyForEventCtrl($scope, $window, $state, $stateParams, $translate, $location, $modal, alertService, cdEventsService, cdUsersService, cdDojoService, usSpinnerService) {
    var dojoEvents = $scope.dojoRowIndexExpandedCurr;
    var eventIndex = $scope.tableRowIndexExpandedCurr;
    
    $scope.cancel = function () {
      if(dojoEvents){
        $scope.showEventInfo(dojoEvents, eventIndex);
      } else {
        $scope.showEventInfo(eventIndex, $scope.event.id);
      }
    }
    
    $scope.showSessionDetails = function (session) {
      var sessionModalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: '/dojos/template/events/session-details',
        controller: 'session-modal-controller',
        size: 'lg',
        resolve: {
          session: function () {
            return session;
          },
          event: function () {
            return $scope.event;
          },
          eventUserSelection: function () {
            return $scope.eventUserSelection;
          }
        }
      });

      sessionModalInstance.result.then(function (result) {
        if(result.ok === false) return alertService.showError($translate.instant(result.why));
        alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
      }, null);
    };

    $scope.goToGoogleMaps = function (position) {
      $window.open('https://maps.google.com/maps?z=12&t=m&q=loc:' + position.lat + '+' + position.lng);
    };

  }

  angular.module('cpZenPlatform')
      .controller('apply-for-event-controller', ['$scope', '$window', '$state', '$stateParams', '$translate', '$location', '$modal', 'alertService','cdEventsService', 'cdUsersService', 'cdDojoService', 'usSpinnerService', cdApplyForEventCtrl]);
})();
