(function () {
  'use strict';

  function cdNotifyAllMembersModalCtrl ($scope, $modalInstance, $translate, dojoId, events, cdDojoService, usSpinnerService, alertService) {
    $scope.dojoId = dojoId;
    $scope.events = events;
    $scope.selectedEvent = {
      value: null
    };

    $scope.notifyAllMembers = function () {
      usSpinnerService.spin('notify-all-members-spinner');
      if(!$scope.selectedEvent.value) {
        $scope.selectedEvent.valid = "false";
        return
      } else {
        var selectedEventId = $scope.selectedEvent.value.id
        cdDojoService.notifyAllMembers({dojoId: dojoId, eventId: selectedEventId, emailSubject: $translate.instant('Tickets Now Available for')}, function (response) {
          usSpinnerService.stop('notify-all-members-spinner');
          $modalInstance.dismiss('success')
        }, function (err) {
          usSpinnerService.stop('notify-all-members-spinner');
          alertService.showError(
            $translate.instant('An error has occurred while notifying members') + ': <br /> ' +
            (err.error || JSON.stringify(err))
          );
        });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }

  angular.module('cpZenPlatform')
    .controller('notify-all-members-modal-controller',
      ['$scope', '$modalInstance', '$translate', 'dojoId', 'events', 'cdDojoService', 'usSpinnerService', 'alertService', cdNotifyAllMembersModalCtrl]);
})();
