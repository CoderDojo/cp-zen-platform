 'use strict';

function cdApproveInviteNinjaCtrl($scope, $stateParams, $state, $translate, cdUsersService, alertService, currentUser, usSpinnerService) {
  var parentProfileId = $stateParams.parentProfileId;
  var inviteTokenId = $stateParams.inviteTokenId;
  currentUser = currentUser.data;
  usSpinnerService.spin('approve-invite-ninja-request-spinner');

  var inviteData = {
    parentProfileId: parentProfileId,
    inviteTokenId: inviteTokenId
  };

  cdUsersService.approveInviteNinja(inviteData, function (response) {
    usSpinnerService.stop('approve-invite-ninja-request-spinner');
    alertService.showAlert($translate.instant('Successfully approved invite Ninja request.'));
    $state.go('user-profile', {userId: currentUser.id});
  }, function (err) {
    usSpinnerService.stop('approve-invite-ninja-request-spinner');
    alertService.showError($translate.instant('Error approving invite Ninja request.'));
  });

}

angular.module('cpZenPlatform')
  .controller('approve-invite-ninja-controller', ['$scope', '$stateParams', '$state', '$translate', 'cdUsersService', 'alertService', 'currentUser', 'usSpinnerService', cdApproveInviteNinjaCtrl]);