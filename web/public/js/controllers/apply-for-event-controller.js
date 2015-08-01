'use strict';

function cdApplyForEventCtrl($scope, $state, $stateParams, $translate, $location, alertService, cdEventsService, cdUsersService, cdDojoService, usSpinnerService) {
  var dojoEvents = $scope.dojoRowIndexExpandedCurr;
  var eventIndex = $scope.tableRowIndexExpandedCurr;

  $scope.cancel = function () {
    if(dojoEvents){
      $scope.showEventInfo(dojoEvents, eventIndex);
    } else {
      $scope.showEventInfo(eventIndex, $scope.event.id);
    }
  }

  $scope.apply = function () {
    usSpinnerService.spin('apply-for-event-spinner');
    if(!_.isEmpty($scope.currentUser)) {

      if(!dojoEvents) {
        //Make sure that this user is a member of this Dojo.
        cdDojoService.dojosForUser($scope.currentUser.id, function (response) {
          var dojos = response;
          var isMember = _.find(dojos, function (dojo) {
            return dojo.id === $scope.dojoId;
          });

          if (isMember) {

            var applyData = {
              eventId: $scope.event.id,
              children: $scope.applyData.childrenSelected,
              user: $scope.currentUser,
              emailSubject: $translate.instant('Event application received')
            };

            $scope.applyForEvent(applyData, $scope.event.id, eventIndex);

          } else {
            usSpinnerService.stop('apply-for-event-spinner');
            alertService.showAlert($translate.instant('Please click the Join Dojo button before applying for events.'));
          }
        });
      } else {
        var applyData = {
          eventId: dojoEvents.events[eventIndex].id,
          children: $scope.applyData.childrenSelected,
          user: $scope.currentUser,
          emailSubject: $translate.instant('Event application received')
        };

        $scope.applyForEvent(applyData, null, eventIndex, dojoEvents);
      }
    } else {
      $state.go('register-account', {referer:$location.url()});
    }
  }

  $scope.applyForEvent = function(applyData, eventId, eventIndex, dojoEvents){
    cdEventsService.applyForEvent(applyData, function (response) {
      usSpinnerService.stop('apply-for-event-spinner');
      alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
      if(dojoEvents){
        $scope.showEventInfo(dojoEvents, eventIndex);
      } else {
        $scope.showEventInfo(eventIndex, eventId);
      }
    });
  }

}

angular.module('cpZenPlatform')
    .controller('apply-for-event-controller', ['$scope', '$state', '$stateParams', '$translate', '$location', 'alertService','cdEventsService', 'cdUsersService', 'cdDojoService', 'usSpinnerService', cdApplyForEventCtrl]);
