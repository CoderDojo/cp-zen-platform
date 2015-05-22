 'use strict';

function cdAcceptDojoMentorInvitationCtrl($scope, $window, $state, $stateParams, $location, auth, cdDojoService, usSpinnerService, alertService) {
  var dojoId = $stateParams.dojoId;
  var inviteToken = $stateParams.mentorInviteToken;
  var currentPath = $location.path();
  
  auth.get_loggedin_user(function(user) {
    if($state.current.url === '/accept_dojo_mentor_invitation/:dojoId/:mentorInviteToken') {
      $window.location.href = '/dashboard' + currentPath;
    } else {

      usSpinnerService.spin('mentor-invitation-spinner');
      $scope.user = user;
      var tokenData = {dojoId:dojoId, 
        inviteToken:inviteToken, 
        currentUserEmail: $scope.user.email,
        currentUserId: $scope.user.id
      };

      cdDojoService.acceptMentorInvite(tokenData, function (response) {
        usSpinnerService.stop('mentor-invitation-spinner');
        if(response.status === 1) {
          alertService.showAlert('Invitation Accepted!', function () {
            $state.go('my-dojos');
          });
        } else {
          alertService.showError('Invalid Invitation', function () {
            $state.go('my-dojos');
          });
        }
      }, function (err) {
        usSpinnerService.stop('mentor-invitation-spinner');
        alertService.showError('Error accepting invitation:' + err);
      });
    }

  }, function () {
    //Not logged in
    $state.go('register-account', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-mentor-invitation-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'cdDojoService', 'usSpinnerService', 'alertService', cdAcceptDojoMentorInvitationCtrl]);