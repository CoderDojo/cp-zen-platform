 'use strict';

function cdAcceptDojoUserInvitationCtrl($scope, $window, $state, $stateParams, $location, auth, cdDojoService, usSpinnerService, alertService, $translate) {
  var dojoId = $stateParams.dojoId;
  var inviteToken = $stateParams.userInviteToken;
  var currentPath = $location.path();
  
  auth.get_loggedin_user(function(user) {
    if($state.current.url === '/accept_dojo_user_invitation/:dojoId/:userInviteToken') {
      $window.location.href = '/dashboard' + currentPath;
    } else {

      usSpinnerService.spin('user-invitation-spinner');
      $scope.user = user;
      var tokenData = {dojoId:dojoId, 
        inviteToken:inviteToken, 
        currentUserEmail: $scope.user.email,
        currentUserId: $scope.user.id
      };

      cdDojoService.acceptUserInvite(tokenData, function (response) {
        usSpinnerService.stop('user-invitation-spinner');
        if(!response.error) {
          alertService.showAlert($translate.instant('Invitation Accepted'), function () {
            $state.go('my-dojos');
          });
        } else {
          alertService.showError($translate.instant('Invalid Invitation'), function () {
            $state.go('my-dojos');
          });
        }
      }, function (err) {
        usSpinnerService.stop('mentor-invitation-spinner');
        alertService.showError($translate.instant('Error accepting invitation'));
      });
    }

  }, function () {
    //Not logged in
    $state.go('register-account', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-user-invitation-controller', ['$scope', '$window', '$state', 
      '$stateParams', '$location', 'auth', 'cdDojoService', 
      'usSpinnerService', 'alertService', '$translate', cdAcceptDojoUserInvitationCtrl]);