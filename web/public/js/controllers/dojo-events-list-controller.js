'use strict';
/*global $*/
function cdDojoEventsListCtrl($scope, $state, $location, $translate, $q, cdEventsService, cdUsersService, cdDojoService, tableUtils, alertService, auth, utilsService) {
  var dojoId = $scope.dojoId;
  $scope.filter = {dojo_id:dojoId};
  $scope.itemsPerPage = 10;
  $scope.applyData = {};
  $scope.isMember = false;

  auth.get_loggedin_user(function (user) {
    $scope.currentUser = user;

    //Get users current user types in this Dojo.
    cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId:dojoId}, function (response) {
      if(!_.isEmpty(response)) {
        $scope.isMember = true;

        $scope.loadPage($scope.filter, true);

        //retrieve user's children
        var query = {userId:$scope.currentUser.id};
        cdUsersService.userProfileData(query, function (response) {
          var parentProfile = response;
          var children = parentProfile.children;
          var childProfiles = [];
          async.each(children, function (child, cb) {
            cdUsersService.userProfileData({userId:child}, function (response) {
              if(response.userType === 'attendee-u13') {
                childProfiles.push(response);
              }
              cb();
            });
          }, function (err) {
            if(err) {
              console.error(err);
              alertService.showError($translate.instant('Error loading events'));
            }
            var childUsers = [];
            async.each(childProfiles, function (childProfile, cb) {
              //Load sys_user objects
              cdUsersService.load(childProfile.userId, function (response) {
                childUsers.push(response);
                cb();
              });
            }, function (err) {
              if(err) {
                console.error(err);
                alertService.showError($translate.instant('Error loading events'));
              }
              $scope.childUsers = childUsers;
            });
          });
        });
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

    $scope.sort = $scope.sort ? $scope.sort: {dates: 1};

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

  }

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

}

angular.module('cpZenPlatform')
    .controller('dojo-events-list-controller', ['$scope', '$state', '$location', '$translate', '$q', 'cdEventsService', 'cdUsersService', 'cdDojoService', 'tableUtils', 'alertService', 'auth', 'utilsService', cdDojoEventsListCtrl]);
