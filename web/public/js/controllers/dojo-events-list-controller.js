(function () {
  'use strict';
  /*global $*/
  function cdDojoEventsListCtrl($scope, $state, $location, $translate, $q, cdEventsService,
      cdUsersService, cdDojoService, tableUtils, alertService, auth, utilsService, eventUtils) {
    var dojoId = $scope.dojoId;
    $scope.filter = {dojo_id: dojoId};
    $scope.itemsPerPage = 5;
    $scope.applyData = {};
    $scope.isMember = false;
    $scope.eventUserSelection = {};
    var isAdult = true;

    auth.get_loggedin_user(function (user) {
      $scope.currentUser = user;

      cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId: dojoId}, function (response) {
        if(!_.isEmpty(response)) {
          $scope.isMember = true;

          if(_.includes(response[0].userTypes, 'attendee-o13') || _.includes(response[0].userTypes, 'attendee-u13')) isAdult = false;
          if(!$scope.eventUserSelection[dojoId]) $scope.eventUserSelection[dojoId] = [];
          $scope.eventUserSelection[dojoId].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
          $scope.eventUserSelection[dojoId] = _.uniq($scope.eventUserSelection[dojoId], function (user) { return user.userId; });
          if(isAdult) {
            cdUsersService.loadChildrenForUser($scope.currentUser.id, function (ninjas) {
              _.each(ninjas, function (ninja) {
                $scope.eventUserSelection[dojoId].push({userId: ninja.userId, title: ninja.name});
                $scope.eventUserSelection[dojoId] = _.uniq($scope.eventUserSelection[dojoId], function (user) { return user.userId; });
              });
            });
          }

          $scope.loadEvents($scope.filter, true);
        } else {
          $scope.loadEvents($scope.filter, true);
        }
      });
    }, function(err){
      $scope.loadEvents($scope.filter, true);
    });

    $scope.loadEvents = function (filter, resetFlag, cb) {
      $scope.tableRowIndexExpandedCurr = '';
      $scope.getSortClass = utilsService.getSortClass;

      cb = cb || function () {};

      $scope.sort = $scope.sort ? $scope.sort: {createdAt: -1};

      var query = _.omit({
        dojoId: filter.dojoId,
      }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

      $scope.events = [];
      $scope.currentPageEvents = [];

      cdEventsService.search({dojoId: dojoId, status: 'published', filterPastEvents: true, sort$: $scope.sort}).then(function (result) {
        $scope.totalItems = result.length;
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
        events.sort(eventUtils.nextDateComparator);
        $scope.events = events;
        $scope.pageChanged(true);
      });
    };

    $scope.eventCollapsed = function (eventIndex) {
      $scope.currentPageEvents[eventIndex].isCollapsed = false;
    };

    $scope.pageChanged = function (resetFlag) {
      var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo);
      $scope.currentPageEvents = $scope.events.slice(loadPageData.skip, loadPageData.skip + $scope.itemsPerPage);
    };

    $scope.showEventInfo = function (index, eventId) {
      if (typeof $scope.currentPageEvents[index].isCollapsed === 'undefined') {
        $scope.eventCollapsed(index);
      }

      if ($scope.currentPageEvents[index].isCollapsed === false) {
        $scope.tableRowIndexExpandedCurr = index;
        $scope.currentPageEvents[index].isCollapsed = true;
      } else if ($scope.currentPageEvents[index].isCollapsed === true) {
        $scope.currentPageEvents[index].isCollapsed = false;
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
      $scope.loadEvents($scope.filter, true);
    }
    $scope.canBook = function ($event) {
      return eventUtils.canBook($event.public, $scope.private, $scope.isMember, $scope.verified);
    };
  }

  angular.module('cpZenPlatform')
      .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', '$q', 'cdEventsService',
       'cdUsersService', 'cdDojoService', 'tableUtils', 'alertService', 'auth', 'utilsService', 'eventUtils', cdDojoEventsListCtrl]);

})();
