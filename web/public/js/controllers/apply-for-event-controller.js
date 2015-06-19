'use strict';

function cdApplyForEventCtrl($scope, $modalInstance, $stateParams, $translate, cdEventsService, eventData) {

  var eventId = eventData.id;

  cdEventsService.getEvent(eventId, function (response) {
    var event = response;
    response.date = moment(event.date).format('MMMM Do YYYY, h:mm');
    var userTypes = response.userTypes;
      if(_.contains(userTypes, 'attendee-u13') && _.contains(userTypes, 'attendee-o13')) {
        event.for = $translate.instant('All');
      } else if(_.contains(userTypes, 'attendee-u13')) {
        event.for = '< 13';
      } else {
        event.for = '> 13';
      }
    $scope.event = event;
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
    .controller('apply-for-event-controller', ['$scope', '$modalInstance', '$stateParams', '$translate', 'cdEventsService', 'eventData', cdApplyForEventCtrl]);