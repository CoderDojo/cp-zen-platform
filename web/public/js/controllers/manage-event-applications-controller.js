'use strict';
/*global $*/

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, cdDojoService, cdUsersService, AlertBanner, utilsService) {
  var eventId = $stateParams.eventId;
  var dojoId = $stateParams.dojoId;
  $scope.sort = undefined;
  $scope.itemsPerPage = 10;
  $scope.pagination = {};
  $scope.newApplicant = {};

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.event.capacity = 0;

    cdEventsService.searchSessions({eventId: eventId}, function (sessions) {
      $scope.event.sessions = sessions;

      _.each($scope.event.sessions, function (session, index) {
        _.each(session.tickets, function (ticket) {
          if(ticket.type !== 'other') {
            $scope.event.capacity += ticket.quantity;
          }
        });
        $scope.$watch('event.sessions['+index+'].isOpen', function(isOpen){
          if (isOpen) loadAttendeeList(session.id);
        });
      });
      $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;
    });
  });

  var loadAttendeeList = function(sessionId) {
    $scope.loadPage(sessionId);
  };

  $scope.saveNewApplicant = function (item) {
    var dojoMember = item;
    $scope.newApplicantClicked = false;

    cdUsersService.userProfileData({userId: dojoMember.id}, function (response) {
      var userProfile = response;

      var newApplicant = {
        name: dojoMember.name,
        dateOfBirth: userProfile.dob,
        event_id: eventId,
        status: 'pending',
        user_id: dojoMember.id
      };

      cdEventsService.saveApplication(newApplicant, function (response) {
        //$scope.loadPage($scope.filter, true);
      }, function (err) {
        alertService.showError($translate.instant('Error saving new applicant'));
      });
    }, function (err) {
      alertService.showError($translate.instant('Error loading profile') + '<br>' + JSON.stringify(err));
    });


  }

  $scope.removeApplicant = function (applicant) {
    cdEventsService.removeApplicant(applicant, function (response) {
      $scope.loadPage($scope.filter, true);
    }, function (err) {
      alertService.showError($translate.instant('Error removing applicant') + '<br>' + JSON.stringify(err));
    });
  }

  $scope.pageChanged = function () {
    //$scope.loadPage($scope.filter, false);
  }

  $scope.loadPage = function (sessionId, resetFlag) {
    $scope.approved = {};
    $scope.checkedIn = {};
    $scope.sort = $scope.sort ? $scope.sort: {created: 1};

    var query = _.omit({
      sessionId: sessionId,
    }, function (value) {
      return value === '' || _.isNull(value) || _.isUndefined(value)
    });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pagination.pageNo, query);
    $scope.pagination.pageNo = loadPageData.pageNo;
    $scope.applications = [];

    cdEventsService.searchApplications({sessionId: sessionId, deleted: false}, function (result) {
      $scope.totalItems = result.length;
      _.each(result, function (application) {
        if (application.status === 'approved') {
          $scope.event.totalAttending++;
        } else {
          $scope.event.totalWaitlist++;
        }
      });
    }, function (err) {
      console.error(err);
      alertService.showError($translate.instant('Error loading applications'));
    });

    cdEventsService.searchApplications({sessionId: sessionId, deleted: false, limit$: $scope.itemsPerPage, skip$: loadPageData.skip, sort$: $scope.sort}, function (result) {
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
      console.error(err);
      alertService.showError($translate.instant('Error loading applications'));
    });
  }

  $scope.updateApplication = function (application, updateType) {
    switch(updateType) {
      case 'status':
        updateStatus();
        break;
      case 'attended':
        updateAttended();
        break;
      case 'deleted':
        updateDeleted();
        break;
    }

    function updateStatus() {
      if (!$scope.userIsApproved(application)) {
        //Approve user
        application.status = 'approved';
        $scope.approved[application.id] = true;
        $scope.event.totalAttending++;
        $scope.event.totalWaitlist--;
      } else {
        //Disapprove user
        application.status = 'pending';
        $scope.approved[application.id] = false;
        $scope.event.totalAttending--;
        $scope.event.totalWaitlist++;
      }
    } 

    function updateAttended() {
      if(!$scope.userIsCheckedIn(application)) {
        application.attended = true;
        $scope.checkedIn[application.id] = true;
      } else {
        application.attended = false;
        $scope.checkedIn[application.id] = false;
      }
    }

    function updateDeleted() {
      application.deleted = true;
    }

    application = _.omit(application, ['user', 'age', 'parents', 'dateApplied']);
    application.emailSubject = $translate.instant('Event application approved');
    cdEventsService.updateApplication(application, function (response) {
      if (response.status === 'approved') {
        AlertBanner.publish({
          type: 'info',
          message: response.name + ' ' + $translate.instant('has been successfully approved'),
          timeCollapse: 5000
        });
      }
      $scope.loadPage(response.sessionId);
    }, function (err) {
      alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(err));
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
