'use strict';
/* global google */

function cdPollController($scope, cdPollService, $state, $stateParams, $translate, gmap, atomicNotifyService) {

  $scope.pollId = $stateParams.pollId;
  $scope.dojoId = $stateParams.dojoId;
  $scope.gmap = gmap;
  $scope.title = $translate.instant('Dojo Impact');

  cdPollService.getSetup($scope.pollId, function(poll){
    $scope.poll = poll[0];
    $scope.question = $translate.instant($scope.poll.question);
    $scope.label = $translate.instant($scope.poll.valueUnity);
  });
}

angular.module('cpZenPlatform')
  .controller('poll-controller', ['$scope', 'cdPollService', '$state', '$stateParams', '$translate', 'gmap', 'atomicNotifyService', cdPollController]);
