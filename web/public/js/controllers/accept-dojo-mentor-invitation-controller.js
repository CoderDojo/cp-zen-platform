 'use strict';

function cdAcceptDojoMentorInvitationCtrl($scope, $state, $stateParams, $location, auth, cdDojoService) {
  var dojoId = $stateParams.dojoId;
  var inviteToken = $stateParams.mentorInviteToken;

  auth.get_loggedin_user(function(user) {
    $scope.user = user;
    var tokenData = {dojoId:dojoId, 
      inviteToken:inviteToken, 
      currentUserEmail: $scope.user.email,
      currentUserId: $scope.user.id
    };

    cdDojoService.acceptMentorInvite(tokenData, function (response) {
      
    });

  }, function () {
    //Not logged in
    $state.go('register-account', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-mentor-invitation-controller', ['$scope', '$state', '$stateParams', '$location', 'auth', 'cdDojoService', cdAcceptDojoMentorInvitationCtrl]);