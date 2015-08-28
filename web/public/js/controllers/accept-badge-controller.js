 'use strict';

function cdAcceptBadgeCtrl($scope, $state, cdBadgesService, cdUsersService, alertService, $translate) {
  var userId = $state.params.userId;
  var badgeSlug = $state.params.badgeSlug;

  var parent = false;
  if ($scope.user){
    cdUsersService.userProfileData({userId: $scope.user.id}, function(profile){
      _.each(profile.children, function(child){
        if (child === userId) parent = true;
      })
      finish();
    })
  } else finish();

  function finish(){
    var badgeData = {
      userId: userId,
      parent: parent,
      badgeSlug: badgeSlug
    };

    cdBadgesService.acceptBadge(badgeData, function (response) {
      if(response.error) {
        return alertService.showError($translate.instant(response.error), function () {
          goToProfile();
        });
      }
      return alertService.showAlert($translate.instant('Badge Accepted!'), function () {
        goToProfile();
      });
    });
  }

  function goToProfile() {
    $state.go('user-profile', {userId: userId});
  }
}

angular.module('cpZenPlatform')
    .controller('accept-badge-controller', ['$scope', '$state', 'cdBadgesService', 'cdUsersService', 'alertService', '$translate', cdAcceptBadgeCtrl]);