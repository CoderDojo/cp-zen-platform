 'use strict';

function manageEventApplicationsControllerCtrl($scope, $stateParams, cdEventsService) {
  var eventId = $stateParams.eventId;
  $scope.approved = {};
  $scope.attending = 0;
  $scope.waitlist = 0;

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    cdEventsService.loadEventApplications(eventId, function (response) {
      _.each(response, function(application) {
        if(application.status === 'approved') {
          $scope.approved[application.id] = true;
          $scope.attending++;
          $scope.waitlist = $scope.event.capacity - $scope.attending;
        } else {
          $scope.approved[application.id] = false;
        }
      });
      $scope.applications = response;
    }); 
  });

  $scope.approveApplication = function (application) {
    if(!$scope.userIsApproved(application)) {
      //Approve user
      application.status = 'approved';
      $scope.approved[application.id] = true;
      $scope.attending++;
    } else {
      //Disapprove user
      application.status = 'pending';
      $scope.approved[application.id] = false;
      $scope.attending--;
    }

    cdEventsService.approveApplication(application, function (response) {
      $scope.waitlist = $scope.event.capacity - $scope.attending;
    }); 
    
  }

  $scope.userIsApproved = function(application) {
    var isApproved = $scope.approved[application.id];
    if(isApproved) return true;
    return false;
  }
}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', 'cdEventsService', manageEventApplicationsControllerCtrl]);