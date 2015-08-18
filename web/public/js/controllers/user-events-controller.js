 'use strict';

function userEventsCtrl($scope, $translate, cdEventsService, alertService, currentUser) {
  $scope.applyData = {};
  $scope.currentEvents = false;
  currentUser = currentUser.data;
  $scope.currentUser = currentUser;

  if(currentUser.id){
    cdEventsService.getUserDojosEvents(currentUser.id, function (response) {
      $scope.dojosEvents = response;
      if(_.isEmpty($scope.dojosEvents)) {
        //This user has no Events.
      } else {
        _.each($scope.dojosEvents, function (dojoEvents) {
          if(dojoEvents && dojoEvents.events && dojoEvents.events.length > 0) {
            $scope.currentEvents = true;
            var events = [];
            _.each(dojoEvents.events, function(event){
              if(event.type === 'recurring') {
                //Recurring event
                var startDate = _.first(event.dates);
                var endDate = _.last(event.dates);
                event.dateRange = moment(startDate).format('Do MMMM YY') + ' - ' + moment(endDate).format('Do MMMM YY, HH:mm');
                event.formattedDates = [];
                _.each(event.dates, function (eventDate) {
                  event.formattedDates.push(moment(eventDate).format('Do MMMM YY'));
                });
                event.day = moment(startDate, 'YYYY-MM-DD HH:mm:ss').format('dddd');
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
}

angular.module('cpZenPlatform')
    .controller('user-events-controller', ['$scope', '$translate', 'cdEventsService', 'alertService', 'currentUser', userEventsCtrl]);
