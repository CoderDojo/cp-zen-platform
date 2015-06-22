 'use strict';

function cdDojoEventsListCtrl($scope, $state, $location, $translate, cdEventsService, tableUtils, alertService, auth) {
  var dojoId = $scope.dojoId;
  $scope.filter = {dojo_id:dojoId};
  $scope.itemsPerPage = 10;
  $scope.currentUser;

  auth.get_loggedin_user(function (user) {
    $scope.currentUser = user;
  });

  $scope.pageChanged = function () {
    $scope.loadPage($scope.filter, false);
  };

  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};
    //Only list events for this Dojo
    var dojoQuery = { query: { match: { dojo_id: dojoId }}};
    $scope.sort = $scope.sort ? $scope.sort :[{ date: 'asc' }];

    var query = _.omit({
      dojo_id: filter.dojo_id,
    }, function (value) { return value === '' || _.isNull(value) || _.isUndefined(value) });

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, query);
    $scope.pageNo = loadPageData.pageNo;
    $scope.events = [];

    var meta = {
      sort: $scope.sort,
      from: loadPageData.skip,
      size: $scope.itemsPerPage
    };

    dojoQuery = _.extend(dojoQuery, meta);
    
    cdEventsService.search(dojoQuery).then(function (result) {
      var events = [];
      _.each(result.hits, function (event) {
        var event = event._source;
        event.date = moment(event.date).format('MMMM Do YYYY, h:mm');
        var userTypes = event.userTypes;
        if(_.contains(userTypes, 'attendee-u13') && _.contains(userTypes, 'attendee-o13')) {
          event.for = $translate.instant('All');
        } else if(_.contains(userTypes, 'attendee-u13')) {
          event.for = '< 13';
        } else {
          event.for = '> 13';
        }
        events.push(event);
      });
      $scope.events = events;
      $scope.totalItems = result.total;
      return cb();
    });
  }

  $scope.loadPage($scope.filter, true);

  $scope.tableRowIndexExpandedCurr = '';
 
  $scope.eventCollapsed = function (eventIndex) {
    $scope.events[eventIndex].isCollapsed = false;
  }

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
      sortConfig[columnName] = {order: "asc"};
      sort.push(sortConfig);

      currentTargetEl
        .removeClass(DOWN)
        .addClass(UP);
    } else {
      sortConfig[columnName] = {order: "desc"};
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

}

angular.module('cpZenPlatform')
    .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', 'cdEventsService', 'tableUtils', 'alertService', 'auth', cdDojoEventsListCtrl]);
