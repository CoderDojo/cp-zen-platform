(function () {
  'use strict';

  function acceptSessionInviteCtrl($scope, $state, $stateParams, currentUser, $translate, alertService, usSpinnerService, cdEventsService) {
    var ticketId = $stateParams.ticketId;
    var invitedUserId = $stateParams.invitedUserId;
    usSpinnerService.spin('session-spinner');
    currentUser = currentUser.data;

    if(_.isEmpty(currentUser)) return $state.go('error-404-no-headers');

    var invitation = {
      ticketId: ticketId,
      invitedUserId: invitedUserId,
      emailSubject: {
        'received': 'Your ticket request for %1$s has been received',
        'approved': 'Your ticket for %1$s has been booked',
        'pending': 'Your ticket request for %1$s is pending approval'
      }
    };

    cdEventsService.validateSessionInvitation(invitation, function (response) {
      if(response.ok === true) {
        alertService.showAlert($translate.instant('Invitation successfully validated. Your ticket has been sent to your email.'));
        $state.go('home');
      } else {
        alertService.showAlert($translate.instant(response.why));
        $state.go('home');
      }
    }, function (err) {
      if(err) {
        console.error(err);
        alertService.showError($translate.instant('Invalid session invitation.'));
      }
    })
  }

  angular.module('cpZenPlatform')
    .controller('accept-session-invite-controller', ['$scope', '$state', '$stateParams', 'currentUser', '$translate', 'alertService', 'usSpinnerService', 'cdEventsService', acceptSessionInviteCtrl]);
})();
