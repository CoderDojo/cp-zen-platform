 'use strict';

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, usSpinnerService, cdDojoService, cdUsersService) {
  var eventId = $stateParams.eventId;
  var dojoId  = $stateParams.dojoId;
  $scope.filter = {event_id: eventId};
  $scope.sort = undefined;
  $scope.itemsPerPage = 10;
  $scope.pagination = {};
  var changedApplications = [];

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;
  });

  $scope.dojoMemberSelected = function (item) {
    var dojoMember = item;
    $scope.newApplicantClicked = false;

    var newApplicant = {
        id: 'new-applicant-'+dojoMember.id,
        name: dojoMember.name,
        attended: false,
        dateOfBirth: null,
        event_id: eventId,
        status:'pending',
        user_id: dojoMember.id
    };

    $scope.approved[newApplicant.id] = false;

    $scope.applications.push(newApplicant);
    changedApplications.push(newApplicant);
    $scope.waitlist++;
  }

  $scope.removeApplicant = function(applicant) {
    //Check if this is a new applicant that was just added (i.e not yet saved to the db)
    if(applicant.id.indexOf('new-applicant') > -1) {
      var applicationsIndexToDelete = $scope.applications.indexOf(applicant);
      var changedApplicationsIndexToDelete = changedApplications.indexOf(applicant);
      $scope.applications.splice(applicationsIndexToDelete, 1);
      changedApplications.splice(changedApplicationsIndexToDelete, 1);
    } else {
      cdEventsService.removeApplicant(applicant, function (response) {
        $scope.loadPage($scope.filter, true);
      });
    }
  }

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  }

 $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    $scope.approved = {};
    $scope.attending = 0;
    $scope.waitlist = 0;
    changedApplications = [];

    var eventApplicationsQuery = { query: { match: { event_id: eventId }}};
    $scope.sort = $scope.sort ? $scope.sort :[{ name: {order:'asc', ignore_unmapped:true}}];

    var query = _.omit({
      event_id: filter.event_id,
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pagination.pageNo, query);
    $scope.pagination.pageNo = loadPageData.pageNo;
    $scope.applications = [];

    var meta = {
      sort: $scope.sort,
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    var eventApplicationsQueryNoLimit = angular.copy(eventApplicationsQuery);
    //Query elasticsearch to get total number of applicants.
    cdEventsService.searchApplications(eventApplicationsQueryNoLimit, function (result) {
      _.each(result.records, function (application) {
        if(application.status === 'approved') {
          $scope.attending++;
        } else {
          $scope.waitlist++;
        }
      });
    });

    eventApplicationsQuery = _.extend(eventApplicationsQuery, meta);

    cdEventsService.searchApplications(eventApplicationsQuery, function (result) {
      
      async.each(result.records, function(application, cb) {
        if(application.status === 'approved') {
          $scope.approved[application.id] = true;
        } else {
          $scope.approved[application.id] = false;
        }

        cdUsersService.load(application.userId, function (response) {
          application.user = response;
          cb();
        });
      }, function (err) {
        $scope.applications = result.records;
        $scope.totalItems = result.total;
        cdDojoService.loadDojoUsers({dojoId: dojoId}, function (response) {
          var dojoMembers = response;
          var dojoMembersToDelete = [];

          //Only show users that are not already in $scope.applications
          for(var i = dojoMembers.length - 1; i >= 0; i--) {
            var application = _.findWhere($scope.applications, {userId:dojoMembers[i].id});
            if(application) dojoMembers.splice(i, 1);
          }

          $scope.dojoMembers = dojoMembers;
        });
      });

    });
  }

  $scope.toggleSort = function ($event, columnName) {
    var className, descFlag, sortConfig = {},sort = [], currentTargetEl;

    var DOWN = 'glyphicon-chevron-down';
    var UP = 'glyphicon-chevron-up';
    var ACTIVE_COL = 'green-text';
    var ACTIVE_COL_CLASS = ".green-text";

    function isDesc(className) {
      var result = className.indexOf(DOWN);

      return result > -1 ? true : false;
    }

    currentTargetEl = angular.element($event.currentTarget);

    className = $event.currentTarget.className;

    angular.element(ACTIVE_COL_CLASS).removeClass(ACTIVE_COL);

    descFlag = isDesc(className);

    if (descFlag) {
      sortConfig[columnName] = {order: "asc", ignore_unmapped:true};
      sort.push(sortConfig);

      currentTargetEl
        .removeClass(DOWN)
        .addClass(UP);
    } else {
      sortConfig[columnName] = {order: "desc", ignore_unmapped:true};
      sort.push(sortConfig);
      currentTargetEl
        .removeClass(UP)
        .addClass(DOWN);
    }

    currentTargetEl.addClass(ACTIVE_COL);

    angular.element("span.sortable")
      .not(ACTIVE_COL_CLASS)
      .removeClass(UP)
      .addClass(DOWN);

    $scope.sort = sort;
    $scope.loadPage($scope.filter, true);
  }

  $scope.loadPage($scope.filter, true);

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

    var applicationAlreadyUpdated = _.find(changedApplications, function(changedApplication) {
      return changedApplication.id === application.id;
    });

    if(!applicationAlreadyUpdated) {
      changedApplications.push(application);
    }

  }

  $scope.saveApplications = function() {
    if(changedApplications.length === 0) return alertService.showAlert($translate.instant('No applications have been changed.'));
    usSpinnerService.spin('manage-event-applications-spinner');

    cdEventsService.bulkUpdateApplications(changedApplications, function (response) {
      usSpinnerService.stop('manage-event-applications-spinner');
      alertService.showAlert($translate.instant('Applications successfully updated'));
      $scope.loadPage($scope.filter, true);
    }, function (err) {
      usSpinnerService.stop('manage-event-applications-spinner');
      alertService.showError($translate.instant('Error updating applications') + ': <br/>' + JSON.stringify(err));
      $scope.loadPage($scope.filter, true);
    });
  }

  $scope.userIsApproved = function(application) {
    var isApproved = $scope.approved[application.id];
    if(isApproved) return true;
    return false;
  }

  $scope.createNewApplicant = function () {
    if($scope.newApplicantClicked === true) return $scope.newApplicantClicked = false;
    return $scope.newApplicantClicked = true;
  }

  $scope.cancelNewApplicant = function () {
    $scope.newApplicantClicked = false;
  }
}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$translate', 'alertService', 'cdEventsService', 'tableUtils', 'usSpinnerService', 'cdDojoService', 'cdUsersService', manageEventApplicationsControllerCtrl]);
