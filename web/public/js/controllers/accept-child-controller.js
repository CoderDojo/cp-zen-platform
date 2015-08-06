'use strict';

function acceptChildController($scope, $stateParams, auth, $window, $location, usSpinnerService, cdUsersService, alertService, $state, $translate){
  var parentProfileId, childProfileId, inviteToken, currentPath;

  parentProfileId = $stateParams.parentProfileId;
  childProfileId = $stateParams.childProfileId;
  inviteToken = $stateParams.inviteToken;

  currentPath = $location.path();

  auth.get_loggedin_user(function(user){
    if($state.current.url === '/accept-parent-guardian-request/:parentProfileId/:childProfileId/:inviteToken'){
      $window.location.href = '/dashboard' + currentPath;
    } else {
      usSpinnerService.spin('parent-guardian-request-spinner');
      $scope.user = user;

      var data = {
        parentProfileId: parentProfileId,
        childProfileId: childProfileId,
        inviteToken: inviteToken
      };

      var win = function(response, status){
        usSpinnerService.stop('parent-guardian-request-spinner');


        alertService.showAlert($translate.instant('Invitation Accepted'), function(){
          $state.go('home');
        });

      };

      var fail = function(err){
        usSpinnerService.stop('parent-guardian-request-spinner');
        alertService.showError($translate.instant('An error has occured while accepting invitation'));
      };


      cdUsersService.acceptParent(data, win, fail);
    }
  }, function(){
    $state.go('register-account', {referer:$location.url()});
  });
}

angular.module('cpZenPlatform')
  .controller('accept-child-controller', ['$scope',
  '$stateParams', 'auth', '$window', '$location',
  'usSpinnerService', 'cdUsersService', 'alertService', '$state', '$translate',acceptChildController]);
