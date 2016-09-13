(function () {
  'use strict';
  /*global $*/
  function cdDojoEventsListCtrl($scope, $state, $location, $translate, $q, cdEventsService,
      cdUsersService, cdDojoService, tableUtils, alertService, auth, utilsService, eventUtils) {
    var dojoId = $scope.dojoId;
    $scope.filter = {dojo_id:dojoId};
    $scope.itemsPerPage = 10;
    $scope.applyData = {};
    $scope.isMember = false;
    $scope.eventUserSelection = {};
    var isAdult = true;

    auth.get_loggedin_user(function (user) {
      $scope.currentUser = user;

      cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId:dojoId}, function (response) {
        if(!_.isEmpty(response)) {
          $scope.isMember = true;

          if(_.includes(response[0].userTypes, 'attendee-o13') || _.includes(response[0].userTypes, 'attendee-u13')) isAdult = false;
          if(!$scope.eventUserSelection[dojoId]) $scope.eventUserSelection[dojoId] = [];
          $scope.eventUserSelection[dojoId].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
          $scope.eventUserSelection[dojoId] = _.uniq($scope.eventUserSelection[dojoId], function (user) { return user.userId; });
          if(isAdult) {
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

      $scope.sort = $scope.sort ? $scope.sort: {createdAt: -1};

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

          event = eventUtils.getFormattedDates(event);

          var userType = event.userType;
          event.for = $translate.instant(userType);
          events.push(event);
        });
        events.sort(function (eventA, eventB) {
          var eventANextDate = eventUtils.getFutureDates(eventA.dates)[0];
          var eventBNextDate = eventUtils.getFutureDates(eventB.dates)[0];
          eventANextDate = eventANextDate ? eventANextDate.startTime : null;
          eventBNextDate = eventBNextDate ? eventBNextDate.startTime : null;
          if (eventANextDate < eventBNextDate) {
            return -1;
          } else if (eventANextDate > eventBNextDate) {
            return 1;
          } else {
            return 0;
          }
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
      .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', '$q', 'cdEventsService',
       'cdUsersService', 'cdDojoService', 'tableUtils', 'alertService', 'auth', 'utilsService', 'eventUtils', cdDojoEventsListCtrl]);

})();
