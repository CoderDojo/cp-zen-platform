 'use strict';

function cdDojoEventsListCtrl($scope, $state, $location, $translate, $q, cdEventsService, cdUsersService, cdDojoService, tableUtils, alertService, auth) {
  var dojoId = $scope.dojoId;
  $scope.filter = {dojo_id:dojoId};
  $scope.itemsPerPage = 10;
  $scope.applyData = {};

  auth.get_loggedin_user(function (user) {
    $scope.currentUser = user;

    //Get users current user types in this Dojo.
    cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId:dojoId}, function (response) {
      if(!_.isEmpty(response)) {
        var userDojo = response[0];
        var userTypes = userDojo.userTypes;
        $scope.isParent = _.contains(userTypes, 'parent-guardian');
        
        if($scope.isParent) {
          //retrieve this parent's children
          var query = {userId:$scope.currentUser.id};
          cdUsersService.listProfiles(query, function (response) {
            var parentProfile = response;
            var children = parentProfile.children;
            var childProfiles = [];
            async.each(children, function (child, cb) {
              cdUsersService.listProfiles({userId:child}, function (response) {
                if(response.userType === 'attendee-u13') {
                  childProfiles.push(response);
                }
                cb();
              });
            }, function (err) {
              var childUsers = [];
              async.each(childProfiles, function (childProfile, cb) {
                //Load sys_user objects
                cdUsersService.load(childProfile.userId, function (response) {
                  childUsers.push(response);
                  cb();
                });
              }, function (err) {
                $scope.childUsers = childUsers;
              });
            });
          });
        }
      }
    });
  });

  function buildEventsQuery() {
    //Only list published events for this Dojo
    var todaysDate = moment().toDate();
    todaysDate = moment(todaysDate).format('YYYY-MM-DD');
    return {
      query: {
        bool: {
          must:[
            { match: { dojo_id: dojoId }},
            { match: { status: 'published' }},
            { match: { public: true}},
            { 
              range: {
                dates: {
                  gte: todaysDate
                }
              }
            }
          ]   
        },
      }
    };
  }

  $scope.loadPage = function (filter, resetFlag, cb) {
    cb = cb || function () {};

    var dojoQuery = buildEventsQuery();
    
    $scope.sort = $scope.sort ? $scope.sort :[{ dates: {order:'asc', ignore_unmapped:true}}];

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
      _.each(result.records, function (event) {
        if(event.type === 'recurring') {
          var startDate = _.first(event.dates);
          var endDate = _.last(event.dates);
          event.dateRange = moment(startDate).format('Do MMMM YY') + ' - ' + moment(endDate).format('Do MMMM YY, HH:mm');
          event.formattedDates = [];
          _.each(event.dates, function (eventDate) {
            event.formattedDates.push(moment(eventDate).format('Do MMMM YY'));
          });
          event.day = moment(_.first(event.dates), 'YYYY-MM-DD HH:mm:ss').format('dddd');
          event.time = moment(_.first(event.dates)).format('HH:mm');
          if(event.recurringType === 'weekly') {
            event.formattedRecurringType = $translate.instant('Weekly');
          } else {
            event.formattedRecurringType = $translate.instant('Every two weeks');
          }
        } else {
          //One-off event
          var eventDate = _.first(event.dates);
          event.formattedDate = moment(eventDate).format('Do MMMM YY, HH:mm');
        }

        var userType = event.userType;
        //TODO: translate event.type
        event.for = $translate.instant(userType);
        events.push(event);
      });
      $scope.events = events;
      $scope.totalItems = result.total;
    });

  }

  $scope.loadPage($scope.filter, true);

  $scope.tableRowIndexExpandedCurr = '';
 
  $scope.eventCollapsed = function (eventIndex) {
    $scope.events[eventIndex].isCollapsed = false;
  }

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

}

angular.module('cpZenPlatform')
    .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', '$q', 'cdEventsService', 'cdUsersService', 'cdDojoService', 'tableUtils', 'alertService', 'auth', cdDojoEventsListCtrl]);
