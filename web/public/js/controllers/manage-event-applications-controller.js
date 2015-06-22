 'use strict';

function manageEventApplicationsControllerCtrl($scope, $stateParams, $translate, alertService, cdEventsService, tableUtils, usSpinnerService) {
  var eventId = $stateParams.eventId;
  $scope.filter = {event_id: eventId};
  $scope.approved = {};
  $scope.attending = 0;
  $scope.waitlist = 0;
  $scope.sort = undefined;
  $scope.itemsPerPage = 10;
  var changedApplications = [];

  cdEventsService.getEvent(eventId, function (response) {
    $scope.event = response;
    $scope.manageDojoEventApplicationsPageTitle = $scope.event.name;
  });

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  }

 $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};

    var eventApplicationsQuery = { query: { match: { event_id: eventId }}};
    $scope.sort = $scope.sort ? $scope.sort :[{ name: 'asc' }];

    var query = _.omit({
      event_id: filter.event_id,
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.applications = [];

    var meta = {
      sort: $scope.sort,
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    eventApplicationsQuery = _.extend(eventApplicationsQuery, meta);

    cdEventsService.searchApplications(eventApplicationsQuery).then(function (result) {
      var application = [];
      _.each(result.records, function(application) {
        if(application.status === 'approved') {
          $scope.approved[application.id] = true;
          $scope.attending++;
        } else {
          $scope.approved[application.id] = false;
          $scope.waitlist++;
        }
      });
      $scope.applications = result.records;
      $scope.totalItems = result.total;
      return cb();
    });
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
    usSpinnerService.spin('manage-event-applications-spinner');
    cdEventsService.bulkUpdateApplications(changedApplications, function (response) {
      usSpinnerService.stop('manage-event-applications-spinner');
      alertService.showAlert($translate.instant('Applications successfully updated'));
    }, function (err) {
      usSpinnerService.stop('manage-event-applications-spinner');
      alertService.showError($translate.instant('Error updating applications') + ': <br/>' + JSON.stringify(err));
    }); 
  }

  $scope.userIsApproved = function(application) {
    var isApproved = $scope.approved[application.id];
    if(isApproved) return true;
    return false;
  }
}

angular.module('cpZenPlatform')
  .controller('manage-event-applications-controller', ['$scope', '$stateParams', '$translate', 'alertService', 'cdEventsService', 'tableUtils', 'usSpinnerService', manageEventApplicationsControllerCtrl]);
