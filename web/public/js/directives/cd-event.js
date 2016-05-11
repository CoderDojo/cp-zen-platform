;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEvent', function () {
        return {  restrict: 'AE',
          templateUrl: '/dojos/template/events/event-apply',
          controller: ['$scope', 'cdEventsService', 'cdUsersService', '$translate', function($scope, cdEventsService, cdUsersService, $translate) {
            $scope.dojoId = $scope.dojo.id;
            $scope.event.sessions = $scope.sessions;
            $scope.event.formattedDate = moment.utc(_.first($scope.event.dates).startTime).format('Do MMMM YY');
            $scope.eventUserSelection = {};
            $scope.currentUser.profileId = $scope.currentUser.id; 
            $scope.currentUser.id = $scope.currentUser.userId;
            var isParent = false;
            if($scope.currentUser){
              if(_.contains($scope.currentUser.userTypes, 'parent-guardian') || _.contains($scope.currentUser.roles, 'cdf-admin')) isParent = true;
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
