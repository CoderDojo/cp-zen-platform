 'use strict';

function cdAcceptBadgeCtrl($scope, $state, cdBadgesService, cdUsersService, alertService, $translate, auth) {
  var userId = $state.params.userId;
  var badgeSlug = $state.params.badgeSlug;

  var parent = false;

  // Validate from parent for a kid
  auth.get_loggedin_user(function (user) {
    if (user) {
      cdUsersService.loadChildrenForUser(user.id, function (children) {
        parent = _.includes(_.map(children, 'userId'), userId);
        finish();
      })
    } else finish();
  });

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
    .controller('accept-badge-controller', ['$scope', '$state', 'cdBadgesService', 'cdUsersService', 'alertService', '$translate', 'auth', cdAcceptBadgeCtrl]);
