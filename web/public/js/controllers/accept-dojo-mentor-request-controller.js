 'use strict';

function cdAcceptDojoMentorRequestCtrl($scope, $window, $state, $stateParams, $location, auth, cdDojoService, usSpinnerService, alertService) {
  var userId = $stateParams.userId;
  var inviteToken = $stateParams.mentorInviteToken;
  var currentPath = $location.path();

  auth.get_loggedin_user(function(user) {
    if($state.current.url === '/accept_dojo_mentor_request/:userId/:mentorInviteToken') {
      $window.location.href = '/dashboard' + currentPath;
    } else {
      usSpinnerService.spin('mentor-request-spinner');
      $scope.user = user;
      var tokenData = {
        requestedByUser:userId,
        inviteToken:inviteToken, 
        currentUserEmail: $scope.user.email,
        currentUserId: $scope.user.id
      };

      cdDojoService.acceptMentorRequest(tokenData, function (response) {
        usSpinnerService.stop('mentor-request-spinner');
        if(response.status === 1) {
          alertService.showAlert('Mentor Successfully Validated!', function () {
            $state.go('my-dojos');
          });
        } else {
          alertService.showError('Invalid Invite Request', function () {
            $state.go('my-dojos');
          });
        }
        
      });
    }

  }, function () {
    //Not logged in
    $state.go('login', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-mentor-request-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'cdDojoService', 'usSpinnerService', 'alertService', cdAcceptDojoMentorRequestCtrl]);