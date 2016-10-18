;(function() {
  'use strict';

function cdPoll(){
    return {
      templateUrl: '/directives/tpl/poll',
      controller: ['$scope', 'cdPollService', '$state', '$stateParams', '$translate', 'atomicNotifyService',
      function ($scope, cdPollService, $state, $stateParams, $translate, atomicNotifyService) {
        $scope.pollId = $stateParams.pollId;
        $scope.dojoId = $stateParams.dojoId;

        cdPollService.getSetup($scope.pollId, function(poll){
          $scope.poll = poll[0];
          $scope.question = $translate.instant($scope.poll.question);
          $scope.label = $translate.instant($scope.poll.valueUnity);
        });

      }],
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdPoll', ['$compile', 'cdPollService', '$interval', cdPoll]);

}());
