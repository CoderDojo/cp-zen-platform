(function () {
  'use strict';
  /*global $*/
  function cdDojoEventsListCtrl($scope, $state, $location, $translate, $q, cdEventsService, cdUsersService, cdDojoService, tableUtils, alertService, auth, utilsService) {
    var dojoId = $scope.dojoId;
    $scope.filter = {dojo_id:dojoId};
    $scope.itemsPerPage = 10;
    $scope.applyData = {};
    $scope.isMember = false;
    $scope.eventUserSelection = {};
    var isParent = false;
    var utcOffset = moment().utcOffset();

    auth.get_loggedin_user(function (user) {
      $scope.currentUser = user;

      cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId:dojoId}, function (response) {
        if(!_.isEmpty(response)) {
          $scope.isMember = true;

          if(_.contains(response[0].userTypes, 'parent-guardian') || _.contains($scope.currentUser.roles, 'cdf-admin')) isParent = true;
          if(!$scope.eventUserSelection[dojoId]) $scope.eventUserSelection[dojoId] = [];
          $scope.eventUserSelection[dojoId].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
          $scope.eventUserSelection[dojoId] = _.uniq($scope.eventUserSelection[dojoId], function (user) { return user.userId; });
          if(isParent) {
            cdUsersService.loadNinjasForUser($scope.currentUser.id, function (ninjas) {
              _.each(ninjas, function (ninja) {
                $scope.eventUserSelection[dojoId].push({userId: ninja.userId, title: ninja.name});
                $scope.eventUserSelection[dojoId] = _.uniq($scope.eventUserSelection[dojoId], function (user) { return user.userId; });
              });
            });
          }

          $scope.loadPage($scope.filter, true);
        } else {
          $scope.loadPage($scope.filter, true);
        }
      });
    }, function(err){
      $scope.loadPage($scope.filter, true);
    });

    $scope.loadPage = function (filter, resetFlag, cb) {
      $scope.tableRowIndexExpandedCurr = '';
      $scope.getSortClass = utilsService.getSortClass;

      cb = cb || function () {};

      $scope.sort = $scope.sort ? $scope.sort: {createdAt: 1};

      var query = _.omit({
        dojoId: filter.dojoId,
      }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

      var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
      $scope.pageNo = loadPageData.pageNo;
      $scope.events = [];

      cdEventsService.search({dojoId: dojoId, status: 'published', filterPastEvents: true, limit$: $scope.itemsPerPage, skip$: loadPageData.skip, sort$: $scope.sort}).then(function (result) {
        if (!$scope.isMember) result = _.filter(result, function(event){
          return event.public;
        });

        var events = [];
        _.each(result, function (event) {
          var startDateUtcOffset = moment(_.first(event.dates).startTime).utcOffset();
          var endDateUtcOffset = moment(_.first(event.dates).endTime).utcOffset();

          var startDate = moment.utc(_.first(event.dates).startTime).subtract(startDateUtcOffset, 'minutes').toDate();
          var endDate = moment.utc(_.first(event.dates).endTime).subtract(endDateUtcOffset, 'minutes').toDate();

          if(event.type === 'recurring') {
            event.formattedDates = [];
            _.each(event.dates, function (eventDate) {
              event.formattedDates.push(moment(eventDate.startTime).format('Do MMMM YY'));
            });

            event.day = moment(startDate).format('dddd');
            event.time = moment(startDate).format('HH:mm') + ' - ' + moment(endDate).format('HH:mm');

            if(event.recurringType === 'weekly') {
              event.formattedRecurringType = $translate.instant('Weekly');
              event.formattedDate = $translate.instant('Weekly') + " " +
                $translate.instant('on') + " " + $translate.instant(event.day) + " " +
                $translate.instant('at') + " " + event.time;
            } else {
              event.formattedRecurringType = $translate.instant('Every two weeks');
              event.formattedDate = $translate.instant('Every two weeks') + " " +
                $translate.instant('on') + " " + $translate.instant(event.day) + " " +
                $translate.instant('at') + " " + event.time;
            }
          } else {
            //One-off event
            event.formattedDate = moment(startDate).format('Do MMMM YY') + ', ' +
              moment(startDate).format('HH:mm') +  ' - ' +
              moment(endDate).format('HH:mm');
          }

          var userType = event.userType;
          event.for = $translate.instant(userType);
          events.push(event);
        });
        $scope.events = events;
        cdEventsService.search({dojoId: dojoId, status: 'published', filterPastEvents: true}).then(function (result) {
          $scope.totalItems = result.length;
        }, function (err) {
          console.error(err);
          alertService.showError($translate.instant('Error loading events'));
        });
      }, function (err) {
        console.error(err);
        alertService.showError($translate.instant('Error loading events'));
      });
    };

    $scope.eventCollapsed = function (eventIndex) {
      $scope.events[eventIndex].isCollapsed = false;
    };

    $scope.pageChanged = function () {
      $scope.loadPage($scope.filter, false);
    };

    $scope.showEventInfo = function (index, eventId) {
      if (typeof $scope.events[index].isCollapsed === 'undefined') {
        $scope.eventCollapsed(index);
      }

      if ($scope.events[index].isCollapsed === false) {
        $scope.tableRowIndexExpandedCurr = index;
        $scope.events[index].isCollapsed = true;
      } else if ($scope.events[index].isCollapsed === true) {
        $scope.events[index].isCollapsed = false;
      }
    };

    $scope.toggleSort = function ($event, columnName) {
      var className, descFlag, sortConfig = {};
      var DOWN = 'glyphicon-chevron-down';
      var UP = 'glyphicon-chevron-up';

      function isDesc(className) {
        var result = className.indexOf(DOWN);
        return result > -1;
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

  }

  angular.module('cpZenPlatform')
      .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', '$q', 'cdEventsService', 'cdUsersService', 'cdDojoService', 'tableUtils', 'alertService', 'auth', 'utilsService', cdDojoEventsListCtrl]);

})();
