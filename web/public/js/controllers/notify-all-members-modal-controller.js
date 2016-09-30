(function () {
  'use strict';

  function cdNotifyAllMembersModalCtrl ($scope, $uibModalInstance, $translate, dojoId, events, cdDojoService, usSpinnerService, alertService) {
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
        cdDojoService.notifyAllMembers({dojoId: dojoId, eventId: selectedEventId, emailSubject: 'Tickets Now Available for %1$s'}, function (response) {
          usSpinnerService.stop('notify-all-members-spinner');
          $uibModalInstance.dismiss('success')
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
      $uibModalInstance.dismiss('cancel');
    };
  }

  angular.module('cpZenPlatform')
    .controller('notify-all-members-modal-controller',
      ['$scope', '$uibModalInstance', '$translate', 'dojoId', 'events', 'cdDojoService', 'usSpinnerService', 'alertService', cdNotifyAllMembersModalCtrl]);
})();
