'use strict';
/*global $*/

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, cdDojoService, cdUsersService, AlertBanner, utilsService) {
  var eventId = $stateParams.eventId;
  var dojoId = $stateParams.dojoId;
  var applicationCheckInDates = [];

  $scope.sort = undefined;
  $scope.pagination = {itemsPerPage: 10};
  $scope.newApplicant = {};
  $scope.eventStats = {totalAttending:0, totalWaitlist: 0};
  $scope.sessionStats = {};
  $scope.filter = {};

  $scope.attendanceDropdownSettings = {
    idProp: 'date', 
    externalIdProp: '',
    displayProp: 'date',
    showUncheckAll: false,
    showCheckAll: false,
    scrollableHeight: '200px',
    scrollable: true
  };

  $scope.attendanceDropdownEvents = {
    onItemSelect: function (item) {
      item.attended = true;
      item.dojoId = dojoId;
      cdEventsService.updateApplicationAttendance(item, function (response) {

      }, function (err) {
        if(err) console.error(err);
      });
    },
    onItemDeselect: function (item) {
      item.attended = false;
      item.dojoId = dojoId;
      cdEventsService.updateApplicationAttendance(item, function (response) {
        
      }, function (err) {
        if(err) console.error(err);
      });
    }
  }

  $scope.ticketTypes = [
    {name: 'ninja', title: 'Ninja' },
    {name: 'parent-guardian', title: 'Parent/guardian'},
    {name: 'mentor', title: 'Mentor'},
    {name: 'other', title: 'Other'}
  ];

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.event.capacity = 0;
    _.each(response.dates, function (eventDateObj) {
      var date = moment(eventDateObj.startTime).format('Do MMMM YY');
      applicationCheckInDates.push(date);
    });

    cdEventsService.searchSessions({eventId: eventId}, function (sessions) {
      $scope.event.sessions = sessions;

      _.each($scope.event.sessions, function (session, index) {
        if(!$scope.sessionStats[session.id]) $scope.sessionStats[session.id] = {};
        $scope.sessionStats[session.id].capacity = 0;
        $scope.sessionStats[session.id].attending = 0;
        $scope.sessionStats[session.id].waitlist = 0;
        _.each(session.tickets, function (ticket) {
          if(ticket.type !== 'other') {
            $scope.event.capacity += ticket.quantity;
            $scope.sessionStats[session.id].capacity += ticket.quantity;
          }
        });
        $scope.$watch('event.sessions['+index+'].isOpen', function (isOpen){
          if (isOpen) loadAttendeeList(session);
        });
      });

      $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;

      async.each($scope.event.sessions, function (session, cb) {
        cdEventsService.searchApplications({sessionId: session.id, deleted: false}, function (applications) {
          _.each(applications, function (application) {
            if(application.status === 'approved') {
              $scope.eventStats.totalAttending++;
            } else {
              $scope.eventStats.totalWaitlist++;
            }
          });
          return cb();
        }, function (err) {
          if(err) console.error(err);
        });
      }, function (err) {
        if(err) console.error(err);
      });

    });
  });

  var loadAttendeeList = function(session) {
    $scope.loadPage(session.id);
  };

  $scope.filterApplications = function (sessionId) {
    $scope.loadPage(sessionId);
  };

  // $scope.saveNewApplicant = function (item) {
  //   var dojoMember = item;
  //   $scope.newApplicantClicked = false;

  //   cdUsersService.userProfileData({userId: dojoMember.id}, function (response) {
  //     var userProfile = response;

  //     var newApplicant = {
  //       name: dojoMember.name,
  //       dateOfBirth: userProfile.dob,
  //       event_id: eventId,
  //       status: 'pending',
  //       user_id: dojoMember.id
  //     };

  //     cdEventsService.saveApplication(newApplicant, function (response) {
  //       //$scope.loadPage($scope.filter, true);
  //     }, function (err) {
  //       alertService.showError($translate.instant('Error saving new applicant'));
  //     });
  //   }, function (err) {
  //     alertService.showError($translate.instant('Error loading profile') + '<br>' + JSON.stringify(err));
  //   });


  // }

  // $scope.removeApplicant = function (applicant) {
  //   cdEventsService.removeApplicant(applicant, function (response) {
  //     $scope.loadPage($scope.filter, true);
  //   }, function (err) {
  //     alertService.showError($translate.instant('Error removing applicant') + '<br>' + JSON.stringify(err));
  //   });
  // }

  $scope.pageChanged = function (sessionId) {
    $scope.loadPage(sessionId, false);
  }

  $scope.loadPage = function (sessionId, resetFlag) {
    $scope.approved = {};
    $scope.checkedIn = {};
    $scope.sort = $scope.sort ? $scope.sort: {created: 1};
    $scope.sessionStats[sessionId].attending = 0;
    $scope.sessionStats[sessionId].waitlist = 0;

    var query = _.omit({
      sessionId: sessionId,
      deleted: false
    }, function (value) {
      return value === '' || _.isNull(value) || _.isUndefined(value)
    });

    if(!_.isEmpty($scope.filter)) {
      _.extend(query, $scope.filter);
    }

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.pagination.itemsPerPage, $scope.pagination.pageNo, query);
    $scope.pagination.pageNo = loadPageData.pageNo;
    $scope.applications = [];

    cdEventsService.searchApplications(_.extend({sessionId: sessionId, deleted: false}, $scope.filter), function (result) {
      $scope.pagination.totalItems = result.length;
      _.each(result, function (application) {
        if (application.status === 'approved') {
          $scope.sessionStats[sessionId].attending++;
        } else {
          $scope.sessionStats[sessionId].waitlist++;
        }
      });
    }, function (err) {
      if(err) {
        console.error(err);
        alertService.showError($translate.instant('Error loading applications'));
      }
    });

    var meta = {
      limit$: $scope.pagination.itemsPerPage, 
      skip$: loadPageData.skip, 
      sort$: $scope.sort
    };

    _.extend(query, meta);

    cdEventsService.searchApplications(query, function (result) {
      async.each(result, function (application, cb) {
        if (application.status === 'approved') {
          $scope.approved[application.id] = true;
        } else {
          $scope.approved[application.id] = false;
        }

        if(application.attended) {
          $scope.checkedIn[application.id] = true;
        } else {
          $scope.checkedIn[application.id] = false;
        } 

        application.age = moment().diff(application.dateOfBirth, 'years');
        application.dateApplied = moment(application.created).format('Do MMMM YY');

        application.applicationDates = [];
        _.each(applicationCheckInDates, function (checkInDate) {
          application.applicationDates.push({applicationId: application.id, date: checkInDate});
        });

        application.attendanceModel = [];
        _.each(application.attendance, function (attendanceDate) {
          var checkInDate = moment(attendanceDate).format('Do MMMM YY');
          application.attendanceModel.push({applicationId: application.id, date: checkInDate})
        });

        cdUsersService.load(application.userId, function (response) {
          application.user = response;
          application.parents = [];
          cdUsersService.userProfileData({userId: application.user.id}, function (response) {
            async.each(response.parents, function (parentUserId, cb) {
              cdUsersService.load(parentUserId, function (response) {
                application.parents.push(response);
                cb();
              });
            }, cb);
          });
        });

      }, function (err) {
        $scope.applications = result;
        cdDojoService.loadDojoUsers({dojoId: dojoId}, function (response) {
          var dojoMembers = response;
          var availableMembers = [];

          //Only show users that are not already in $scope.applications
          for (var i = dojoMembers.length - 1; i >= 0; i--) {
            var application = _.findWhere($scope.applications, {userId: dojoMembers[i].id});
            if (!application) { availableMembers.push(dojoMembers[i]) }
          }

          $scope.dojoMembers = availableMembers;
        });
      });
    }, function (err) {
      if(err) {
        console.error(err);
        alertService.showError($translate.instant('Error loading applications'));
      }
    });
  }

  $scope.updateApplication = function (application, updateType) {
    var resetFlag = false;
    var successMessage;
    switch(updateType) {
      case 'status':
        updateStatus();
        break;
      case 'attended':
        updateAttended();
        break;
      case 'deleted':
        updateDeleted();
        resetFlag = true;
        break;
    }

    function updateStatus() {
      if (!$scope.userIsApproved(application)) {
        //Approve user
        application.status = 'approved';
        $scope.approved[application.id] = true;
        $scope.sessionStats[application.sessionId].attending++;
        $scope.eventStats.totalAttending++;
        $scope.sessionStats[application.sessionId].waitlist--;
        $scope.eventStats.totalWaitlist--;
        successMessage = application.name + ' ' + $translate.instant('has been successfully approved');
      } else {
        //Disapprove user
        application.status = 'pending';
        $scope.approved[application.id] = false;
        $scope.sessionStats[application.sessionId].attending--;
        $scope.eventStats.totalAttending--;
        $scope.sessionStats[application.sessionId].waitlist++;
        $scope.eventStats.totalWaitlist++;
      }
    } 

    function updateAttended() {
      if(!$scope.userIsCheckedIn(application)) {
        application.attended = true;
        $scope.checkedIn[application.id] = true;
        successMessage = application.name + ' ' + $translate.instant('has been checked in');
      } else {
        application.attended = false;
        $scope.checkedIn[application.id] = false;
      }
    }

    function updateDeleted() {
      application.deleted = true;
    }

    application = _.omit(application, ['user', 'age', 'parents', 'dateApplied', 'applicationDates', 'attendanceModel']);
    application.emailSubject = $translate.instant('Event application approved');
    cdEventsService.saveApplication(application, function (response) {
      if (response.status === 'approved' || response.attended) {
        AlertBanner.publish({
          type: 'info',
          message: successMessage,
          timeCollapse: 5000
        });
      } else if (response.error){
        alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(response.error));
      }
      if(resetFlag) $scope.loadPage(response.sessionId);
    }, function (err) {
      if(err) alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(err));
    });
  }

  $scope.userIsApproved = function (application) {
    var isApproved = $scope.approved[application.id];
    if (isApproved) return true;
    return false;
  }

  $scope.userIsCheckedIn = function (application) {
    var isCheckedIn = $scope.checkedIn[application.id];
    if (isCheckedIn) return true;
    return false;
  }

  $scope.createNewApplicant = function () {
    if ($scope.newApplicantClicked === true) return $scope.newApplicantClicked = false;
    return $scope.newApplicantClicked = true;
  }

  $scope.cancelNewApplicant = function () {
    $scope.newApplicantClicked = false;
  }

}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$translate', 'alertService', 'cdEventsService', 'tableUtils', 'cdDojoService', 'cdUsersService', 'AlertBanner', 'utilsService', manageEventApplicationsControllerCtrl]);
