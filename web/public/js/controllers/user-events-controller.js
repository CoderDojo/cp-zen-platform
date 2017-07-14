(function () {
  'use strict';

  function userEventsCtrl($scope, $translate, cdEventsService, cdUsersService,
    alertService, currentUser, utilsService, cdDojoService, usersDojos, usSpinnerService, eventUtils) {
    $scope.applyData = {};
    $scope.currentEvents = false;
    currentUser = currentUser.data;
    usersDojos = usersDojos.data;
    $scope.currentUser = currentUser;
    $scope.eventUserSelection = {};
    $scope.eventTypeTranslations = {
      'one-off' : $translate.instant('One off'),
      'recurring' : $translate.instant('Term')
    };

    var utcOffset = moment().utcOffset();

    if(currentUser.id){
      $scope.loadPage = function () {
        $scope.sort = $scope.sort ? $scope.sort: {createdAt: 1};
        var query = {status: 'published', filterPastEvents: true, sort$: $scope.sort};
        cdEventsService.getUserDojosEvents(query, function (response) {
          usSpinnerService.stop('user-events-spinner');
          $scope.dojosEvents = response;
          if(_.isEmpty($scope.dojosEvents)) {
            //This user has no Events.
          } else {
            _.each($scope.dojosEvents, function (dojoEvents) {
              if(dojoEvents && dojoEvents.events && dojoEvents.events.length > 0) {
                cdDojoService.getUsersDojos({userId:$scope.currentUser.id, dojoId: dojoEvents.dojo.id}, function (response) {
                  if(!_.isEmpty(response)) {
                    var isAdult = true;
                    if(_.includes(response[0].userTypes, 'attendee-o13') || _.includes(response[0].userTypes, 'attendee-u13')) isAdult = false;
                    if(!$scope.eventUserSelection[dojoEvents.dojo.id]) $scope.eventUserSelection[dojoEvents.dojo.id] = [];
                    $scope.eventUserSelection[dojoEvents.dojo.id].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
                    $scope.eventUserSelection[dojoEvents.dojo.id] = _.uniq($scope.eventUserSelection[dojoEvents.dojo.id], function (user) { return user.userId; });
                    if (isAdult) {
                      cdUsersService.loadChildrenForUser(currentUser.id, function (ninjas) {
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
                _.each(dojoEvents.events, function (event) {
                  var formattedEvent = eventUtils.getFormattedDates(event);
                  var userType = event.userType;
                  event.for = $translate.instant(userType);
                  events.push(formattedEvent);
                });

                dojoEvents.events = events;
              }
            });
          }
        }, function (err) {
          usSpinnerService.stop('user-events-spinner');
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
          var formattedEvent = eventUtils.getFormattedDates(event);
          var userType = event.userType;
          event.for = $translate.instant(userType);
          events.push(formattedEvent);
        });

        var dojoUpdated = _.find($scope.dojosEvents, function (dojoObject) {
          return dojoObject.dojo.id === dojoId;
        });
        if (dojoUpdated) dojoUpdated.events = events;

      }, function (err) {
        console.error(err);
        alertService.showError($translate.instant('Error loading events'));
      });
    }

    $scope.getSortClass = utilsService.getSortClass;
  }

  angular.module('cpZenPlatform')
      .controller('user-events-controller', ['$scope', '$translate', 'cdEventsService',
       'cdUsersService', 'alertService', 'currentUser', 'utilsService', 'cdDojoService', 'usersDojos', 'usSpinnerService', 'eventUtils',
        userEventsCtrl]);

})();
