(function () {
  'use strict';

  function cancelSessionInviteCtrl($scope, $state, $stateParams, currentUser, $translate, alertService, usSpinnerService, cdEventsService) {
    
    usSpinnerService.spin('session-spinner');
    
    var applicationId = $stateParams.applicationId;
    var ticketId = $stateParams.eventId;
    currentUser = currentUser.data;

    if (_.isEmpty(currentUser)) {
        return $state.go('error-404-no-headers');
    }

    var application = {
      id: applicationId,
      ticketId: ticketId,
      updateAction: 'delete',
      deleted: true
    };
    
    $scope.showAlertBanner = function (application, successMessage) {
      return (application.status === 'approved' || application.attended || application.deleted) && successMessage !== undefined;
    }

    cdEventsService.bulkApplyApplications([application], function (applications) {   
        
        var successMessage = $translate.instant('Thank you for confirming you will not be in attendance; your ticket has now been cancelled.');
             
        if (_.isEmpty(applications)) {
            return;
        }
        if ($scope.showAlertBanner(applications[0], successMessage)) {
          alertService.showAlert(successMessage);
        } else if (applications.ok === true) {
            alertService.showAlert(successMessage);
        } else {
            alertService.showAlert($translate.instant(applications.why));
        }
        $state.go('home');
        
    }, function (err) {
        if (err) {
            console.error(err);
            alertService.showError($translate.instant('Invalid ticket cancellation link.'));
        }
    })
  }

  angular.module('cpZenPlatform')
    .controller('cancel-session-invite-controller', ['$scope', '$state', '$stateParams', 'currentUser', '$translate', 'alertService', 'usSpinnerService', 'cdEventsService', cancelSessionInviteCtrl]);
})();
