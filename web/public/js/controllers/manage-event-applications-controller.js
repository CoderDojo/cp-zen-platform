'use strict';
/*global $*/

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, cdDojoService, cdUsersService, AlertBanner, utilsService) {
  var eventId = $stateParams.eventId;
  var dojoId = $stateParams.dojoId;
  $scope.filter = {event_id: eventId};
  $scope.sort = undefined;
  $scope.itemsPerPage = 10;
  $scope.pagination = {};
  $scope.newApplicant = {};

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;
  });

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
        $scope.loadPage($scope.filter, true);
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
    $scope.loadPage($scope.filter, false);
  }

  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {
      };
    $scope.approved = {};
    $scope.attending = 0;
    $scope.waitlist = 0;
    $scope.sort = $scope.sort ? $scope.sort: {name: 1};

    var query = _.omit({
      eventId: filter.eventId,
    }, function (value) {
      return value === '' || _.isNull(value) || _.isUndefined(value)
    });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pagination.pageNo, query);
    $scope.pagination.pageNo = loadPageData.pageNo;
    $scope.applications = [];

    cdEventsService.searchApplications({eventId: eventId}, function (result) {
      $scope.totalItems = result.length;
      _.each(result, function (application) {
        if (application.status === 'approved') {
          $scope.attending++;
        } else {
          $scope.waitlist++;
        }
      });
    }, function (err) {
      console.error(err);
      alertService.showError($translate.instant('Error loading applications'));
    });

    cdEventsService.searchApplications({eventId: eventId, limit$: $scope.itemsPerPage, skip$: loadPageData.skip, sort$: $scope.sort}, function (result) {
      async.each(result, function (application, cb) {
        if (application.status === 'approved') {
          $scope.approved[application.id] = true;
        } else {
          $scope.approved[application.id] = false;
        }

        application.age = moment().diff(application.dateOfBirth, 'years');

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

  $scope.toggleSort = function ($event, columnName) {
    var className, descFlag, sortConfig = {};
    var DOWN = 'glyphicon-chevron-down';
    var UP = 'glyphicon-chevron-up';

    function isDesc(className) {
      var result = className.indexOf(DOWN);
      return result > -1 ? true : false;
    }

    className = $($event.target).attr('class');

    descFlag = isDesc(className);
    if (descFlag) {
      sortConfig[columnName] = -1;
    } else {
      sortConfig[columnName] = 1;
    }

    $scope.sort = sortConfig;
    $scope.loadPage($scope.filter, true);
  }

  $scope.loadPage($scope.filter, true);

  $scope.updateApplicationStatus = function (application) {
    if (!$scope.userIsApproved(application)) {
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

    application = _.omit(application, ['user', 'age', 'parents']);
    application.emailSubject = $translate.instant('Event application approved');
    cdEventsService.updateApplication(application, function (response) {
      if (response.status === 'approved') {
        AlertBanner.publish({
          type: 'info',
          message: response.name + ' ' + $translate.instant('has been successfully approved'),
          timeCollapse: 5000
        });
      }
    }, function (err) {
      alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(err));
    });
  }

  $scope.userIsApproved = function (application) {
    var isApproved = $scope.approved[application.id];
    if (isApproved) return true;
    return false;
  }

  $scope.createNewApplicant = function () {
    if ($scope.newApplicantClicked === true) return $scope.newApplicantClicked = false;
    return $scope.newApplicantClicked = true;
  }

  $scope.cancelNewApplicant = function () {
    $scope.newApplicantClicked = false;
  }

  $scope.getSortClass = utilsService.getSortClass;
}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$translate', 'alertService', 'cdEventsService', 'tableUtils', 'cdDojoService', 'cdUsersService', 'AlertBanner', 'utilsService', manageEventApplicationsControllerCtrl]);
