'use strict';

function cdApplyForEventCtrl($scope, $modalInstance, $stateParams, cdEventsService, eventData) {

  var eventId = eventData.id;

  cdEventsService.getEvent(eventId, function (response) {
    response.date = moment(response.date).format('MMMM Do YYYY, h:mm');
    $scope.event = response;
  });

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.apply = function () {
    cdEventsService.applyForEvent(eventId, function (response) {
      $modalInstance.close(response.status);
    });
  }

}

angular.module('cpZenPlatform')
    .controller('apply-for-event-controller', ['$scope', '$modalInstance', '$stateParams', 'cdEventsService', 'eventData', cdApplyForEventCtrl]);