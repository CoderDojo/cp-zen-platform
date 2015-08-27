(function() {
  'use strict';
  /*global $*/

  function manageDojoEventsCtrl($scope, $stateParams, $state, $location, cdDojoService, cdEventsService, tableUtils, $translate, auth, utilsService, alertService) {
    $scope.dojoId = $stateParams.dojoId;
    $scope.filter = {dojoId: $scope.dojoId};
    $scope.pagination = {itemsPerPage: 10};
    $scope.manageDojoEventsPageTitle = $translate.instant('Manage Dojo Events'); //breadcrumb page title

    auth.get_loggedin_user(function (user) {
      cdDojoService.getUsersDojos({userId: user.id, dojoId: $scope.dojoId}, function (response) {
        var userDojo = response[0];
        $scope.isTicketingAdmin = _.find(userDojo.userPermissions, function (permission) {
          return permission.name === 'ticketing-admin';
        });
      });
    });

    $scope.isNotPast = function(dates) {
      return !$scope.isPast(dates)
    }

    $scope.isPast = function(dates) {
      var now = new Date();
      var res = _.find(dates, function(date){
      date = new Date(date);
        return date > now;
      });
      return !res;
    }

    cdDojoService.load($scope.dojoId, function (response) {
      $scope.dojo = response;
    });

    $scope.pageChanged = function () {
      $scope.loadPage($scope.filter, false);
    }

    $scope.createEvent = function() {
      $state.go('create-dojo-event', {dojoId: $scope.dojoId});
    }

    $scope.updateEventStatus = function(event, status) {
      delete event.formattedDate;
      event.status = status;
      cdEventsService.saveEvent(event, function (response) {
        $scope.loadPage($scope.filter, true);
      });
    }

    $scope.loadPage = function (filter, resetFlag) {
      //Only list events for this Dojo
      //sorting: -1 = descending, +1 = ascending
      $scope.sort = $scope.sort ? $scope.sort: {dates: 1};

      var query = _.omit({
        dojoId: filter.dojoId,
      }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

      var loadPageData = tableUtils.loadPage(resetFlag, $scope.pagination.itemsPerPage, $scope.pagination.pageNo, query);
      $scope.pagination.pageNo = loadPageData.pageNo;
      $scope.events = [];
      cdEventsService.search({dojoId: $scope.dojoId, limit$: $scope.pagination.itemsPerPage, skip$: loadPageData.skip, sort$: $scope.sort}).then(function (result) {
        var events = [];
        _.each(result, function (event) {
          if(event.type === 'recurring') {
            var startDate = event.dates[0];
            var lastIndex = event.dates.length - 1;
            var endDate = event.dates[lastIndex];
            event.formattedDate = moment(startDate).format('MMMM Do YYYY') + ' - ' + moment(endDate).format('MMMM Do YYYY');
          } else {
            //One-off event
            var eventDate = event.dates[0];
            event.formattedDate = moment(eventDate).format('MMMM Do YYYY');
          }

          //Retrieve number of applicants & attendees
          cdEventsService.searchApplications({eventId: event.id}, function (result) {
            var numOfApplicants = result.length;
            var numAttending = 0;
            _.each(result, function (application) {
              if(application.status === 'approved') numAttending++;
            })
            event.applicants = numOfApplicants;
            event.attending = numAttending;
          }, function (err) {
            console.error(err);
            alertService.showError($translate.instant('Error loading applications'));
          });
          events.push(event);
        });
        $scope.events = events;
        cdEventsService.search({dojoId: $scope.dojoId}).then(function (result) {
          $scope.pagination.totalItems = result.length;
        }, function (err) {
          console.error(err);
          alertService.showError($translate.instant('Error loading events'));
        });
      }, function (err) {
        console.error(err);
        alertService.showError($translate.instant('Error loading events'));
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

    $scope.getSortClass = utilsService.getSortClass;
  }

  angular.module('cpZenPlatform')
    .controller('manage-dojo-events-controller', ['$scope', '$stateParams', '$state', '$location', 'cdDojoService', 'cdEventsService', 'tableUtils', '$translate', 'auth', 'utilsService', 'alertService', manageDojoEventsCtrl]);

})();

