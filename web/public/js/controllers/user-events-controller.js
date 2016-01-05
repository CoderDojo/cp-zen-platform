(function () {
  'use strict';

  function userEventsCtrl($scope, $translate, cdEventsService, cdUsersService, alertService, currentUser, utilsService, cdDojoService, usersDojos) {
    $scope.applyData = {};
    $scope.currentEvents = false;
    currentUser = currentUser.data;
    usersDojos = usersDojos.data;
    $scope.currentUser = currentUser;
    $scope.eventUserSelection = {};

    var utcOffset = moment().utcOffset();

    if(currentUser.id){
      $scope.loadPage = function () {
        $scope.sort = $scope.sort ? $scope.sort: {createdAt: 1};
        var query = {userId: currentUser.id, status: 'published', filterPastEvents: true, sort$: $scope.sort};
        cdEventsService.getUserDojosEvents(query, function (response) {
          $scope.dojosEvents = response;
          if(_.isEmpty($scope.dojosEvents)) {
            //This user has no Events.
          } else {
            _.each($scope.dojosEvents, function (dojoEvents) {
              if(dojoEvents && dojoEvents.events && dojoEvents.events.length > 0) {
                cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId: dojoEvents.dojo.id}, function (response) {
                  if(!_.isEmpty(response)) {
                    var isParent = false;
                    if(_.contains(response[0].userTypes, 'parent-guardian') || _.contains($scope.currentUser.roles, 'cdf-admin')) isParent = true;
                    if(!$scope.eventUserSelection[dojoEvents.dojo.id]) $scope.eventUserSelection[dojoEvents.dojo.id] = [];
                    $scope.eventUserSelection[dojoEvents.dojo.id].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
                    $scope.eventUserSelection[dojoEvents.dojo.id] = _.uniq($scope.eventUserSelection[dojoEvents.dojo.id], function (user) { return user.userId; });
                    if(isParent) {
                      cdUsersService.loadNinjasForUser(currentUser.id, function (ninjas) {
                        _.each(ninjas, function (ninja) {
                          $scope.eventUserSelection[dojoEvents.dojo.id].push({userId: ninja.userId, title: ninja.name});
                          $scope.eventUserSelection[dojoEvents.dojo.id] = _.uniq($scope.eventUserSelection[dojoEvents.dojo.id], function (user) { return user.userId; });
                        });
                      });
                    }
                  }
                });

                $scope.currentEvents = true;
                $scope.sort[dojoEvents.dojo.id] = {createdAt: 1};
                var events = [];
                dojoEvents.title = $translate.instant('Events for Dojo') + ': ' + dojoEvents.dojo.name;
                _.each(dojoEvents.events, function(event){

                  var startDateUtcOffset = moment(_.first(event.dates).startTime).utcOffset();
                  var endDateUtcOffset = moment(_.first(event.dates).endTime).utcOffset();

                  var startDate = moment(_.first(event.dates).startTime).subtract(startDateUtcOffset, 'minutes').toDate();
                  var endDate = moment(_.first(event.dates).endTime).subtract(endDateUtcOffset, 'minutes').toDate();

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

                dojoEvents.events = events;
              }
            });
          }
        }, function (err) {
          alertService.showError( $translate.instant('Error loading Events') + ' ' + err);
        })
      }

      $scope.isTicketingAdmin = _.find(usersDojos, function (userDojo) {
        return _.find(userDojo.userPermissions, function (userPermission) {
          return userPermission.name === 'ticketing-admin';
        });
      });

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

          var startDate = moment.utc(_.first(event.dates).startTime).subtract(utcOffset, 'minutes').toDate();
          var endDate = moment.utc(_.first(event.dates).endTime).subtract(utcOffset, 'minutes').toDate();

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
      .controller('user-events-controller', ['$scope', '$translate', 'cdEventsService', 'cdUsersService', 'alertService', 'currentUser', 'utilsService', 'cdDojoService', 'usersDojos', userEventsCtrl]);

})();
