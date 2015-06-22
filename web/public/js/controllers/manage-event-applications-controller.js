 'use strict';

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService) {
  var eventId = $stateParams.eventId;
  $scope.approved = {};
  $scope.attending = 0;
  $scope.waitlist = 0;
  
  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;
    cdEventsService.loadEventApplications(eventId, function (response) {
      _.each(response, function(application) {
        if(application.status === 'approved') {
          $scope.approved[application.id] = true;
          $scope.attending++;
        } else {
          $scope.approved[application.id] = false;
          $scope.waitlist++;
        }
      });
      $scope.applications = response;
    }); 
  });

  $scope.updateApplicationStatus = function (application) {
    if(!$scope.userIsApproved(application)) {
      //Approve user
      application.status = 'approved';
      $scope.approved[application.id] = true;
      $scope.attending++;
      $scope.waitlist--;
    } else {
      //Disapprove user
      application.status = 'pending';
      $scope.approved[application.id] = false;
      $scope.attending--;
      $scope.waitlist++;
    }

    cdEventsService.updateApplication(application, function (response) {
      
    }, function (err) {
      alertService.showError($translate.instant('Error updating application') + ': <br/>' + JSON.stringify(err));
    }); 
    
  }

  $scope.userIsApproved = function(application) {
    var isApproved = $scope.approved[application.id];
    if(isApproved) return true;
    return false;
  }
}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$translate', 'alertService', 'cdEventsService', manageEventApplicationsControllerCtrl]);