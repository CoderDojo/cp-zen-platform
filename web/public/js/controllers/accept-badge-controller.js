 'use strict';

function cdAcceptBadgeCtrl($scope, $state, cdBadgesService, alertService, $translate) {
  var userId = $state.params.userId;
  var badgeSlug = $state.params.badgeSlug;
  
  var badgeData = {
    userId: userId,
    badgeSlug: badgeSlug
  };

  cdBadgesService.acceptBadge(badgeData, function (response) {
    if(response.error) {
      return alertService.showError($translate.instant(response.error), function () {
        goToProfile();
      });
    }
    return alertService.showAlert($translate.instant('Badge Accepted! It is now visible on your profile page.'), function () {
      goToProfile();
    });
  });

  function goToProfile() {
    $state.go('user-profile', {userId: userId});
  }
}

angular.module('cpZenPlatform')
    .controller('accept-badge-controller', ['$scope', '$state', 'cdBadgesService', 'alertService', '$translate', cdAcceptBadgeCtrl]);