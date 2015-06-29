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
    $scope.attending = 0;
    $scope.waitlist = 0;
    $scope.attended = 0;


    $scope.pagination = {
      totalItems: 0,
      itemsPerPage: 10,
      currentPage: 1,
      change: function() {
        loadPage($scope.pagination.currentPage);
      }
    };


    $scope.sort = {
      direction: 'asc',
      toggleDirection: function() {
        $scope.sort.direction = ($scope.sort.direction === 'asc') ? 'desc' : 'asc';

        loadPage($scope.pagination.currentPage);
      }
    };


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
    };


    cdEventsService.getEvent(eventId, function(response) {
      $scope.event = response;
      $scope.manageDojoEventAttendancePageTitle = $scope.event.name;
    });


    function getSearchApplicationQuery(eventId, status, currentPage, sortDirection) {
      var term = {};

      if (status === 'approved') {
        term = {
          status: status
        };
      } else if (status === 'attended') {
        term = {
          attended: true
        };
      }

      return {
        query: {
          filtered: {
            query: {
              match: {
                event_id: eventId
              }
            },
            filter: {
              bool: {
                must: {
                  term: term
                }
              }
            }
          }
        },
        sort: {
          name: sortDirection
        }
      };
    }


    function searchApprovedApplications(eventId, currentPage, sortDirection, callback) {
      var query = getSearchApplicationQuery(eventId, 'approved', currentPage, sortDirection);
      cdEventsService.searchApplications(query, callback.bind(null, null), callback);
    }


    function searchAttendedApplications(eventId, currentPage, sortDirection, callback) {
      var query = getSearchApplicationQuery(eventId, 'attended', currentPage, sortDirection);
      cdEventsService.searchApplications(query, callback.bind(null, null), callback);
    }


    function loadPage(currentPage) {
      searchApprovedApplications(
        eventId,
        $scope.pagination.currentPage,
        $scope.sort.direction,
        function(err, results) {
          if (err) {
            return console.error(err);
          }
          $scope.approvedApplications = results.records || [];
        }
      );
    }


    async.series([
      searchApprovedApplications.bind(
        null,
        eventId,
        $scope.pagination.currentPage,
        $scope.sort.direction
      ),
      searchAttendedApplications.bind(
        null,
        eventId,
        $scope.pagination.currentPage,
        $scope.sort.direction
      )
    ], function(err, results) {
      if (err) {
        return console.error(err);
      }

      var approvedApplicationsSearchResult = results[0][0];
      var attendedApplicationsSearchResult = results[1][0];

      $scope.approvedApplications = approvedApplicationsSearchResult.records || [];
      $scope.attending = approvedApplicationsSearchResult.total;
      $scope.pagination.totalItems = $scope.attending;

      $scope.attended = attendedApplicationsSearchResult.total;
    });
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

