'use strict';

function cdApplyForEventCtrl($scope, $state, $stateParams, $translate, $location, alertService, cdEventsService, usSpinnerService) {
  var eventIndex = $scope.tableRowIndexExpandedCurr;

  $scope.cancel = function () {
    $scope.showEventInfo(eventIndex, $scope.event.id);
  }

  $scope.apply = function () {
    usSpinnerService.spin('apply-for-event-spinner');
    if(!_.isEmpty($scope.currentUser)) {
      if($scope.event.id) {
        cdEventsService.applyForEvent($scope.event.id, function (response) {
          var status = response.status;
          if(status === 'success') {
            usSpinnerService.stop('apply-for-event-spinner');
            alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
            $scope.showEventInfo(eventIndex, $scope.event.id);
          } else {
            usSpinnerService.stop('apply-for-event-spinner');
            alertService.showError($translate.instant('Error applying for event') + status);
          }
        });
      } else {
        usSpinnerService.stop('apply-for-event-spinner');
        alertService.showError($translate.instant('Error applying for event'));
      }
    } else {
      $state.go('register-account', {referer:$location.url()});
    }
  }

}

angular.module('cpZenPlatform')
    .controller('apply-for-event-controller', ['$scope', '$state', '$stateParams', '$translate', '$location', 'alertService','cdEventsService', 'usSpinnerService', cdApplyForEventCtrl]);