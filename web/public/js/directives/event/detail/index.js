;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEventDetail', function () {
        return {
          restrict: 'AE',
          templateUrl: '/directives/tpl/event/detail',
          controller: ['$scope', 'cdEventsService', 'cdUsersService', '$translate', '$window', function($scope, cdEventsService, cdUsersService, $translate, $window) {
            $scope.event.sessions = $scope.sessions;
            $scope.event.formattedDate = moment.utc(_.head($scope.event.dates).startTime).format('Do MMMM YY');
            $scope.eventUserSelection = {};
            $scope.currentUser = {};
            var isParent = false;
            $scope.dojoId = $scope.dojo ? $scope.dojo.id : $scope.event.dojoId;
            if($scope.profile && $scope.dojoId){
              $scope.currentUser = $scope.profile.user;
              $scope.currentUser.profileId = $scope.profile.id;
              if(_.includes($scope.profile.userTypes, 'parent-guardian') || _.includes($scope.profile.roles, 'cdf-admin')) isParent = true;
              if(!$scope.eventUserSelection[$scope.dojoId]) $scope.eventUserSelection[$scope.dojoId] = [];
              $scope.eventUserSelection[$scope.dojoId].push({userId: $scope.currentUser.id, title: $translate.instant('Myself')});
              $scope.eventUserSelection[$scope.dojoId] = _.uniq($scope.eventUserSelection[$scope.dojoId], function (user) { return user.userId; });
              if(isParent) {
                cdUsersService.loadNinjasForUser($scope.currentUser.id, function (ninjas) {
                  _.each(ninjas, function (ninja) {
                    $scope.eventUserSelection[$scope.dojoId].push({userId: ninja.userId, title: ninja.name});
                    $scope.eventUserSelection[$scope.dojoId] = _.uniq($scope.eventUserSelection[$scope.dojoId], function (user) { return user.userId; });
                  });
                });
              }
            }
            $scope.goToGoogleMaps = function () {
              $window.open('https://maps.google.com/maps?z=12&t=m&q=loc:' + $scope.event.position.lat + '+' + $scope.event.position.lng);
            };
          }]
        };
    });

}());
