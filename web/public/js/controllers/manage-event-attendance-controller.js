(function() {
  'use strict';

  function manageEventAttendanceCtrl(
    $scope,
    $stateParams,
    $translate,
    AlertBanner,
    cdEventsService,
    cdUsersService
  ) {
    var eventId = $stateParams.eventId;
    var dojoId = $stateParams.dojoId;

    $scope.capacity = 0;
    $scope.attending = 0;
    $scope.waitlist = 0;
    $scope.attended = 0;
    $scope.attendance = {eventDate:{}};
    $scope.eventGuestListDownloadLink = '/api/1.0/events/export-guest-list/' + eventId;

    $scope.pagination = {
      totalItems: 0,
      itemsPerPage: 10,
      currentPage: 1,
      change: function() {
        loadPage($scope.pagination.currentPage);
      }
    };

    $scope.onAttendedClicked = function(attendanceRecord) {
      var attendanceName = attendanceRecord.name;
      attendanceRecord = _.omit(attendanceRecord, 'parents', 'age', 'name');
      cdEventsService.saveAttendance(attendanceRecord, function(response){
        if (response.attended === true) {
          AlertBanner.publish({
            type: 'info',
            message: attendanceName + ' ' + $translate.instant('has been successfully checked in'),
            timeCollapse: 5000
          });
        }
      }, function() {
        // Revert on error
        attendanceRecord.attended = !attendanceRecord.attended;
      });
    };

    function searchApprovedApplications(eventId, currentPage, callback) {
      var skip = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
      cdEventsService.searchAttendance({eventId: eventId, eventDate: $scope.attendance.eventDate.date, limit$: $scope.pagination.itemsPerPage, skip$: skip}, callback);
    }

    function loadPage(currentPage) {
      $scope.attendanceRecords = null;
      retrieveAttendanceData(function (err, response) {
        if (err) return console.error(err);
      });
    }

    async.series([
      loadEventData,
      retrieveAttendanceData
    ]);

    function loadEventData(done) {
      cdEventsService.getEvent(eventId, function (response) {
        _.each(response.dates, function (date, index) {
          response.dates[index] = {text: moment(date).format('Do MMMM YY'), date: date};
        });
        $scope.event = response;
        //TODO: Set eventDate to most recent date.
        $scope.attendance.eventDate = _.first($scope.event.dates);
        $scope.manageDojoEventAttendancePageTitle = $scope.event.name;
        done();
      });
    }

    function retrieveAttendanceData(done) {
      searchApprovedApplications(eventId, $scope.pagination.currentPage, function(results) {
        async.each(results, function (attendanceRecord, cb) {
          cdUsersService.userProfileData({userId:attendanceRecord.userId}, function (response) {
            var userProfile = response;
            attendanceRecord.parents = [];
            async.each(userProfile.parents, function (parentUserId, cb) {
              cdUsersService.load(parentUserId, function (response) {
                attendanceRecord.parents.push(response);
                cb();
              });
            }, function (err) {
              if (err) return console.error(err);
              attendanceRecord.name = userProfile.name;
              attendanceRecord.age = moment().diff(userProfile.dob, 'years');
              cb();
            });
          });
        }, function (err) {
          if (err) return console.error(err);
          $scope.attendanceRecords = results || [];
          cdEventsService.searchAttendance({eventId: eventId, eventDate: $scope.attendance.eventDate.date}, function (result) {
            $scope.pagination.totalItems = result.length;
          });
          done();
        });
      });
    }

    $scope.eventDateSelected = function (item) {
      loadPage($scope.pagination.currentPage);
    }

  }

  angular.module('cpZenPlatform')
    .controller('manage-event-attendance-controller', [
      '$scope',
      '$stateParams',
      '$translate',
      'AlertBanner',
      'cdEventsService',
      'cdUsersService',
      manageEventAttendanceCtrl
    ]);
})();

