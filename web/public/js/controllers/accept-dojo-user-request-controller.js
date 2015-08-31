 'use strict';

function cdAcceptDojoUserRequestCtrl($scope, $window, $state, $stateParams, $location, auth, cdDojoService, usSpinnerService, alertService, $translate) {
  var userId = $stateParams.userId;
  var inviteToken = $stateParams.userInviteToken;
  var currentPath = $location.path();

  auth.get_loggedin_user(function(user) {
    if($state.current.url === '/accept_dojo_user_request/:userId/:userInviteToken') {
      $window.location.href = '/dashboard' + currentPath;
    } else {
      usSpinnerService.spin('user-request-spinner');
      $scope.user = user;
      var tokenData = {
        requestedByUser: userId,
        inviteToken: inviteToken
      };

      cdDojoService.acceptUserRequest(tokenData, function (response) {
        usSpinnerService.stop('user-request-spinner');
        if(!response.error) {
          alertService.showAlert($translate.instant('User Successfully Validated'), function () {
            $state.go('my-dojos');
          });
        } else {
          alertService.showError($translate.instant(response.error), function () {
            $state.go('my-dojos');
          });
        }
      }, function (err) {
        usSpinnerService.stop('user-request-spinner');
        alertService.showError($translate.instant('Error validating user request'));
      });
    }

  }, function () {
    //Not logged in
    $state.go('login', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
    .controller('accept-dojo-user-request-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'cdDojoService', 'usSpinnerService', 'alertService', '$translate', cdAcceptDojoUserRequestCtrl]);