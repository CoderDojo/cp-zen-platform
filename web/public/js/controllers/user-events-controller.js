 'use strict';

function userEventsCtrl($scope, $translate, cdEventsService, cdUsersService, alertService, currentUser, utilsService) {
  $scope.applyData = {};
  $scope.currentEvents = false;
  currentUser = currentUser.data;
  $scope.currentUser = currentUser;

  var utcOffset = moment().utcOffset();

  //retrieve children
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

  if(currentUser.id){
    $scope.loadPage = function () {
      $scope.sort = $scope.sort ? $scope.sort: {dates: -1};
      var query = {userId: currentUser.id, status: 'published', filterPastEvents: true, sort$: $scope.sort};
      cdEventsService.getUserDojosEvents(query, function (response) {
        $scope.dojosEvents = response;
        if(_.isEmpty($scope.dojosEvents)) {
          //This user has no Events.
        } else {
          _.each($scope.dojosEvents, function (dojoEvents) {
            if(dojoEvents && dojoEvents.events && dojoEvents.events.length > 0) {
              $scope.currentEvents = true;
              $scope.sort[dojoEvents.dojo.id] = {dates: -1};
              var events = [];
              dojoEvents.title = $translate.instant('Events for Dojo') + ': ' + dojoEvents.dojo.name;
              _.each(dojoEvents.events, function(event){
                if(event.type === 'recurring') {
                  //Recurring event
                  var startDate = moment.utc(_.first(event.dates)).subtract(utcOffset, 'minutes').toDate();
                  var endDate = moment.utc(_.last(event.dates)).subtract(utcOffset, 'minutes').toDate();
                  event.dateRange = moment(startDate).format('Do MMMM YY') + ' - ' + moment(endDate).format('Do MMMM YY, HH:mm');
                  event.formattedDates = [];
                  _.each(event.dates, function (eventDate) {
                    event.formattedDates.push(moment(eventDate).format('Do MMMM YY'));
                  });
                  event.day = moment(startDate).format('dddd');
                  event.time = moment(startDate).format('HH:mm');
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
                  var eventDate = moment.utc(_.first(event.dates)).subtract(utcOffset, 'minutes').toDate();
                  event.formattedDate = moment(eventDate).format('Do MMMM YY, HH:mm');
                }

                var userType = event.userType;
                event.for = $translate.instant(userType);
                events.push(event);
              });

              dojoEvents.events = events;
            }
          });
        }
      }, function (err) {
        alertService.showError( $translate.instant('Error loading Events') + ' ' + err);
      })
    }

    $scope.loadPage();
  }

  $scope.tableRowIndexExpandedCurr = '';
  $scope.dojoRowIndexExpandedCurr = '';

  $scope.eventCollapsed = function (dojosEventsIndex, eventIdx) {
    $scope.dojosEvents[dojosEventsIndex].events[eventIdx].isCollapsed = false;
  }


  $scope.showEventInfo = function (dojoEvents, eventIdx) {
    $scope.dojosEventsIndex = _.indexOf($scope.dojosEvents, dojoEvents);
    if (typeof $scope.dojosEvents[$scope.dojosEventsIndex].events[eventIdx].isCollapsed === 'undefined') {
      $scope.eventCollapsed($scope.dojosEventsIndex, eventIdx);
    }

    if ($scope.dojosEvents[$scope.dojosEventsIndex].events[eventIdx].isCollapsed === false) {
      $scope.tableRowIndexExpandedCurr = eventIdx;
      $scope.dojoRowIndexExpandedCurr = dojoEvents;
      $scope.dojosEvents[$scope.dojosEventsIndex].events[eventIdx].isCollapsed = true;
    } else if ($scope.dojosEvents[$scope.dojosEventsIndex].events[eventIdx].isCollapsed === true) {
      $scope.dojosEvents[$scope.dojosEventsIndex].events[eventIdx].isCollapsed = false;
    }
  }

  $scope.hasEvents = function(event){
    return event.events.length > 0;
  }

  $scope.toggleSort = function ($event, columnName, dojoId) {
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

    $scope.sort[dojoId] = sortConfig;
    $scope.loadDataForDojo(dojoId);
  }

  $scope.loadDataForDojo = function (dojoId) {
    var events = [];

    cdEventsService.search({dojoId: dojoId, status: 'published', filterPastEvents: true, sort$: $scope.sort[dojoId]}).then(function (result) {
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

      var dojoUpdated = _.find($scope.dojosEvents, function (dojoObject) {
        return dojoObject.dojo.id === dojoId;
      });
      if(dojoUpdated) dojoUpdated.events = events;

    }, function (err) {
      console.error(err);
      alertService.showError($translate.instant('Error loading events'));
    });
  }

  $scope.getSortClass = utilsService.getSortClass;
}

angular.module('cpZenPlatform')
    .controller('user-events-controller', ['$scope', '$translate', 'cdEventsService', 'cdUsersService', 'alertService', 'currentUser', 'utilsService', userEventsCtrl]);
