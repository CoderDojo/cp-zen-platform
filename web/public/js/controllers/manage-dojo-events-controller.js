(function() {
  'use strict';
  /*global $*/

  function manageDojoEventsCtrl($scope, $stateParams, $state, cdDojoService, cdEventsService, tableUtils, $translate, auth, utilsService, alertService) {
    $scope.dojoId = $stateParams.dojoId;
    $scope.filter = {dojoId: $scope.dojoId};
    $scope.pagination = {itemsPerPage: 10};
    $scope.manageDojoEventsPageTitle = $translate.instant('Manage Dojo Events'); //breadcrumb page title
    var utcOffset = moment().utcOffset();

    auth.get_loggedin_user(function (user) {
      var isCDFAdmin = user && _.contains(user.roles, 'cdf-admin');
      if(!isCDFAdmin) {
        cdDojoService.getUsersDojos({userId: user.id, dojoId: $scope.dojoId}, function (response) {
          if (!response || response.length < 1) {
            return $state.go('error-404-no-headers');
          }
          var userDojo = response[0];
          $scope.isTicketingAdmin = _.find(userDojo.userPermissions, function (permission) {
            return permission.name === 'ticketing-admin';
          });

          if(!$scope.isTicketingAdmin){
            return $state.go('error-404-no-headers');
          }
        });
      } else {
        $scope.isTicketingAdmin = isCDFAdmin;
      }
    });

    $scope.isNotPast = function(event) {
      if(event.type === 'recurring'){
        var dateOfLastEventRecurrence = _.last(event.dates).startTime;
        return moment.utc(dateOfLastEventRecurrence).subtract(utcOffset, 'minutes').diff(moment.utc(), 'minutes') > -480;
      } else {
        var oneOffEventDate = _.first(event.dates).startTime;
        return moment.utc(oneOffEventDate).subtract(utcOffset, 'minutes').diff(moment.utc(), 'minutes') > -480;
      }
    };

    cdDojoService.load($scope.dojoId, function (response) {
      $scope.dojo = response;
    });

    $scope.pageChanged = function () {
      $scope.loadPage($scope.filter, false);
    };

    $scope.createEvent = function() {
      $state.go('create-dojo-event', {dojoId: $scope.dojoId});
    };

    $scope.updateEventStatus = function(event, status) {
      delete event.formattedDate;
      event.status = status;
      if(event.status === 'cancelled') {
        event.emailSubject = $translate.instant('has been cancelled');
      }
      cdEventsService.saveEvent(event, function (response) {
        $scope.loadPage($scope.filter, true);
      });
    };

    $scope.loadPage = function (filter, resetFlag) {
      //Only list events for this Dojo
      //sorting: -1 = descending, +1 = ascending
      $scope.sort = $scope.sort ? $scope.sort: {createdAt: -1};

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
            var startDate = _.first(event.dates).startTime;
            var endDate = _.last(event.dates).startTime;
            event.formattedDate = moment(startDate).format('MMMM Do YYYY') + ' - ' + moment(endDate).format('MMMM Do YYYY');
          } else {
            //One-off event
            var eventDate = _.first(event.dates).startTime;
            event.formattedDate = moment(eventDate).format('MMMM Do YYYY');
          }

          //Retrieve number of applicants & attendees
          cdEventsService.searchApplications({eventId: event.id}, function (result) {
            event.eventStats = {capacity: 0, totalApplicants:0, totalAttending: 0};

            _.each(result, function (application) {
              if(!application.deleted) {
                if(application.status === 'pending' || application.status === 'approved') {
                  event.eventStats.totalApplicants++;
                }
                if(application.status === 'approved') {
                  event.eventStats.totalAttending++;
                }
              }
            });

            cdEventsService.searchSessions({eventId: event.id, status: 'active'}, function (sessions) {
              _.each(sessions, function (session) {
                _.each(session.tickets, function (ticket) {
                  if(ticket.type !== 'other') {
                    event.eventStats.capacity += ticket.quantity;
                  }
                });
              });
            });
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
    .controller('manage-dojo-events-controller', ['$scope', '$stateParams', '$state', 'cdDojoService', 'cdEventsService', 'tableUtils', '$translate', 'auth', 'utilsService', 'alertService', manageDojoEventsCtrl]);

})();

