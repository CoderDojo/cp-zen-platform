;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEventDetail', function () {
        return {
          restrict: 'AE',
          templateUrl: '/directives/tpl/event/detail',
          controller: ['$scope', 'cdEventsService', 'cdUsersService', '$translate', '$window', 'eventUtils',
          function($scope, cdEventsService, cdUsersService, $translate, $window, eventUtils) {
            $scope.event.sessions = $scope.sessions;
            $scope.event.isPast = eventUtils.isEventInPast(_.last($scope.event.dates));
            $scope.event = eventUtils.getFormattedDates($scope.event);
            if (!$scope.event.isPast && $scope.event.type === 'recurring') {
              $scope.event.upcomingDates = eventUtils.getNextDates($scope.event.dates, $scope.event.formattedDates);
              $scope.event.nextDate = moment.utc(_.first($scope.event.upcomingDates).startTime).format('Do MMMM YY');
            }

            $scope.eventUserSelection = {};
            $scope.currentUser = {};
            $scope.dojoId = $scope.dojo ? $scope.dojo.id : $scope.event.dojoId;
            if($scope.profile && $scope.dojoId){
              $scope.currentUser = $scope.profile.user;
              $scope.currentUser.profileId = $scope.profile.id;
              if(!$scope.eventUserSelection[$scope.dojoId]) $scope.eventUserSelection[$scope.dojoId] = [];
              $scope.eventUserSelection[$scope.dojoId].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
              $scope.eventUserSelection[$scope.dojoId] = _.uniq($scope.eventUserSelection[$scope.dojoId], function (user) { return user.userId; });
              cdUsersService.loadNinjasForUser($scope.currentUser.id, function (ninjas) {
                _.each(ninjas, function (ninja) {
                  $scope.eventUserSelection[$scope.dojoId].push({userId: ninja.userId, title: ninja.name});
                  $scope.eventUserSelection[$scope.dojoId] = _.uniq($scope.eventUserSelection[$scope.dojoId], function (user) { return user.userId; });
                });
              });
            }
            $scope.goToGoogleMaps = function () {
              $window.open('https://maps.google.com/maps?z=12&t=m&q=loc:' + $scope.event.position.lat + '+' + $scope.event.position.lng);
            };
          }]
        };
    });

}());
