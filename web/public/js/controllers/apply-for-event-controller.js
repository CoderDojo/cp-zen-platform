'use strict';

function cdApplyForEventCtrl($scope, $state, $stateParams, $translate, $location, alertService, cdEventsService, cdDojoService, usSpinnerService) {
  var eventIndex = $scope.tableRowIndexExpandedCurr;

  $scope.cancel = function () {
    $scope.showEventInfo(eventIndex, $scope.event.id);
  }

  $scope.apply = function () {
    usSpinnerService.spin('apply-for-event-spinner');
    if(!_.isEmpty($scope.currentUser)) {

      //Make sure that this user is a member of this Dojo.
      cdDojoService.dojosForUser($scope.currentUser.id, function (response) {
        var dojos = response;
        var isMember = _.find(dojos, function (dojo) {
          return dojo.id === $scope.dojoId;
        });

        if(isMember) {
          cdEventsService.applyForEvent($scope.event.id, function (response) {
            if(response.error) {
              usSpinnerService.stop('apply-for-event-spinner');
              alertService.showError($translate.instant('Error applying for event') + ': ' + response.error);
            } else {
              usSpinnerService.stop('apply-for-event-spinner');
              alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
              $scope.showEventInfo(eventIndex, $scope.event.id);
            } 
          });
        } else {
          usSpinnerService.stop('apply-for-event-spinner');
          alertService.showAlert($translate.instant('Please click the Join Dojo button before applying for events.'));
        }
      });
    } else {
      $state.go('register-account', {referer:$location.url()});
    }
  }

}

angular.module('cpZenPlatform')
    .controller('apply-for-event-controller', ['$scope', '$state', '$stateParams', '$translate', '$location', 'alertService','cdEventsService', 'cdDojoService', 'usSpinnerService', cdApplyForEventCtrl]);