(function () {
  'use strict';

  function acceptSessionInviteCtrl($scope, $state, $stateParams, currentUser, $translate, alertService, usSpinnerService, cdEventsService, Analytics) {
    var ticketId = $stateParams.ticketId;
    var invitedUserId = $stateParams.invitedUserId;
    usSpinnerService.spin('session-spinner');
    currentUser = currentUser.data;

    if(_.isEmpty(currentUser)) return $state.go('error-404-no-headers');

    var invitation = {
      ticketId: ticketId,
      userId: invitedUserId,
      emailSubject: {
        'received': 'Your ticket request for %1$s has been received',
        'approved': 'Your ticket for %1$s has been booked',
        'pending': 'Your ticket request for %1$s is pending approval'
      }
    };

    cdEventsService.validateTicketInvitation(invitation, function (response) {
      if(response.ok === true) {
        Analytics.trackEvent($state.current.name, 'click', 'accept_ticket_invitation');
        alertService.showAlert($translate.instant('Invitation successfully validated. Your ticket has been sent to your email.'));
        $state.go('dojo-list');
      } else {
        alertService.showAlert($translate.instant(response.why));
        $state.go('dojo-list');
      }
    }, function (err) {
      if (err.status === 410) {
        alertService.showError($translate.instant('The event is fully booked, please wait for the next event or look for other Dojos in your area.'));
      } else {
        alertService.showError($translate.instant('Invalid session invitation.'));
      }
    })
  }

  angular.module('cpZenPlatform')
    .controller('accept-session-invite-controller', ['$scope', '$state', '$stateParams', 'currentUser', '$translate', 'alertService', 'usSpinnerService', 'cdEventsService', 'Analytics', acceptSessionInviteCtrl]);
})();
