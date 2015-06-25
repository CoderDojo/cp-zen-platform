(function() {
  'use strict';

  function manageEventAttendanceCtrl(
    $scope,
    $stateParams,
    $translate,
    alertService,
    cdEventsService,
    tableUtils,
    usSpinnerService,
    cdDojoService
  ) {
    var eventId = $stateParams.eventId;
    var dojoId = $stateParams.dojoId;

    $scope.capacity = 0;
    $scope.atending = 0;
    $scope.waitlist = 0;
    $scope.attended = 0;

    cdEventsService.getEvent(eventId, function(response) {
      $scope.event = response;
      $scope.manageDojoEventAttendancePageTitle = $scope.event.name;
    });


    function loadApplications(eventId, callback) {
      var query = {
        query: {
          match: {
            event_id: eventId
          }
        }
      };

      cdEventsService.searchApplications(query, function(result) {
        var applications = result.records || [];
        callback(applications);
      });
    }


    function getApprovedApplications(applications) {
      return applications.filter(function(application) {
        return application.status === 'approved';
      });
    }


    function getAttended(applications) {
      return applications.filter(function(application) {
        return application.attended;
      });
    }


    function loadApplicationsCallback(applications) {
      var approvedApplications = getApprovedApplications(applications);
      var attendedApplications = getAttended(approvedApplications);

      $scope.attending = approvedApplications.length;
      $scope.waitlist = applications.length - approvedApplications.length;
      $scope.approvedApplications = approvedApplications;
      $scope.attended = attendedApplications.length;
    }


    $scope.onAttendedClicked = function(application) {
      if (application.attended === false) {
        $scope.attended = $scope.attended - 1;
      } else {
        $scope.attended = $scope.attended + 1;
      }

      cdEventsService.updateApplication(application, null, function() {
        // Revert on error
        application.attended = !application.attended;
      });
    }


    loadApplications(eventId, loadApplicationsCallback);
  }


  angular.module('cpZenPlatform')
    .controller('manage-event-attendance-controller', [
      '$scope',
      '$stateParams',
      '$translate',
      'alertService',
      'cdEventsService',
      'tableUtils',
      'usSpinnerService',
      'cdDojoService',
      manageEventAttendanceCtrl
    ]);
})();

