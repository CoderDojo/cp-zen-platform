 'use strict';

function cdAcceptDojoUserRequestCtrl($scope, $window, $state, $stateParams, $location, auth, cdDojoService, usSpinnerService, alertService, $translate) {
  var userId = $stateParams.userId;
  var inviteToken = $stateParams.userInviteToken;
  var currentPath = $location.path();

  auth.get_loggedin_user(function(user) {
    if($location.url === '/accept_dojo_user_request/:userId/:userInviteToken') {
      $window.location.href = '/dashboard' + currentPath;
    } else {
      $window.location.href = '/dashboard/dojos/undefined/join-requests/' + inviteToken + '/status/accept';
    }

  }, function () {
    //Not logged in
    $location.path('/login').search({
      referer: $location.url()
    });
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-user-request-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'cdDojoService', 'usSpinnerService', 'alertService', '$translate', cdAcceptDojoUserRequestCtrl]);
