 'use strict';

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, usSpinnerService, cdDojoService, cdUsersService) {
  var eventId = $stateParams.eventId;
  var dojoId  = $stateParams.dojoId;
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

    cdUsersService.listProfiles({userId:dojoMember.id}, function (response) {
      var userProfile = response;

      var newApplicant = {
        name: dojoMember.name,
        dateOfBirth: userProfile.dob,
        event_id: eventId,
        status:'pending',
        user_id: dojoMember.id
      };

      cdEventsService.saveApplication(newApplicant, function (response) {
        $scope.loadPage($scope.filter, true);
      }, function (err) {
        alertService.showError($translate.instant('Error saving new applicant') + '<br>' + JSON.stringify(err));
      });
    }, function (err) {
      alertService.showError($translate.instant('Error loading profile') + '<br>' + JSON.stringify(err));
    });

    
  }

  $scope.removeApplicant = function(applicant) {
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
    cb = cb || function () {};
    $scope.approved = {};
    $scope.attending = 0;
    $scope.waitlist = 0;

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

        application.age = moment().diff(application.dateOfBirth, 'years');

        cdUsersService.load(application.userId, function (response) {
          application.user = response;
          application.parents = [];
          cdUsersService.listProfiles({userId:application.user.id}, function (response) {
            async.each(response.parents, function (parentUserId, cb) {
              cdUsersService.load(parentUserId, function (response) {
                application.parents.push(response);
                cb();
              });
            }, cb);
          });
          
          
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

    application = _.omit(application, ['user', 'age' , 'parents']);
    cdEventsService.updateApplication(application, null, function (err) {
      alertService.showError($translate.instant('Error updating application') + '<br>' + JSON.stringify(err));
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
