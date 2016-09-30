(function() {
  'use strict';

  function cdSessionInviteModalCtrl($scope, $uibModalInstance, $translate, $state, cdEventsService, dojoId, session, event, eventUserSelection, usSpinnerService, currentUser) {
    $scope.dojoId = dojoId;
    $scope.session = session;
    $scope.event = event;
    $scope.eventUserSelection = eventUserSelection[$scope.event.dojoId];
    $scope.currentUser = currentUser;

    $scope.inviteSettings = {
      displayProp: 'title',
      buttonClasses: 'btn btn-primary btn-block',
      showCheckAll: true,
      showUncheckAll: true,
      idProp: 'userId',
      externalIdProp: 'userId',
      enableSearch: true,
      scrollableHeight: '250px',
      scrollable: true
    };

    _.each($scope.session.tickets, function (ticket) {
      if(!ticket.invites) ticket.invites = [];
    });

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.buildInvites = function (invite) {
      session.invites = invite;
      $uibModalInstance.close({ok: true});
    };

  }

  angular.module('cpZenPlatform')
    .controller('session-invite-modal-controller', ['$scope', '$uibModalInstance', '$translate', '$state', 'cdEventsService', 'dojoId', 'session', 'event', 'eventUserSelection', 'usSpinnerService', 'currentUser', cdSessionInviteModalCtrl]);

})();
