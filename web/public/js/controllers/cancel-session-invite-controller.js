(function () {
  'use strict';

  function cancelSessionInviteCtrl($scope, $state, $stateParams, currentUser, $translate, alertService, usSpinnerService, cdEventsService) {
    
    usSpinnerService.spin('session-spinner');
    
    var applicationId = $stateParams.applicationId;
    var eventId = $stateParams.eventId;
    
    currentUser = currentUser.data;
    if (_.isEmpty(currentUser)) {
        return $state.go('error-404-no-headers');
    }

    var application = {
      id: applicationId,
      eventId: eventId
    };

    cdEventsService.removeApplicant(application, function (response) {   
        
        var successMessage = $translate.instant('Thank you for confirming you will not be in attendance; your application has now been cancelled.');
             
        if (response.ok === true) {
          alertService.showAlert(successMessage);
        } else {
            alertService.showAlert($translate.instant(response.why));
        }
        $state.go('home');
        
    }, function (err) {
        if (err) {
            console.error(err);
            alertService.showError($translate.instant('Invalid application cancellation link.'));
        }
        $state.go('home');
    })
  }

  angular.module('cpZenPlatform')
    .controller('cancel-session-invite-controller', ['$scope', '$state', '$stateParams', 'currentUser', '$translate', 'alertService', 'usSpinnerService', 'cdEventsService', cancelSessionInviteCtrl]);
})();
