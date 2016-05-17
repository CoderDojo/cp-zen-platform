;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEvent', function () {
        return {  restrict: 'AE',
          templateUrl: '/dojos/template/events/event-apply',
          controller: ['$scope', 'cdEventsService', 'cdUsersService', '$translate', function($scope, cdEventsService, cdUsersService, $translate) {
            $scope.event.sessions = $scope.sessions;
            $scope.event.formattedDate = moment.utc(_.first($scope.event.dates).startTime).format('Do MMMM YY');
            $scope.eventUserSelection = {};
            $scope.currentUser = {};
            var isParent = false;
            $scope.dojoId = $scope.dojo ? $scope.dojo.id : $scope.event.dojoId;
            if($scope.profile && $scope.dojoId){
              $scope.currentUser.id = $scope.profile.userId;
              $scope.currentUser.profileId = $scope.profile.id;
              if(_.contains($scope.profile.userTypes, 'parent-guardian') || _.contains($scope.profile.roles, 'cdf-admin')) isParent = true;
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

          }]
        };
    });

}());
