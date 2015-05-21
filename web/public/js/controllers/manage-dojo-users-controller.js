 'use strict';

function cdManageDojoUsersCtrl($scope, $state, cdDojoService, cdUsersService, alertService, tableUtils, usSpinnerService) {
  var dojoId = $state.params.id;
  $scope.itemsPerPage = 10;
  var roles = [];

  $scope.pageChanged = function () {
    $scope.loadPage(false);
  };

  $scope.loadPage = function(resetFlag, cb) {
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
    $scope.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];
    var query = {dojoId:dojoId};

    cdDojoService.loadDojoUsers(query, function (response) {
      $scope.users = response;
      $scope.totalItems = response.length;
      cdUsersService.getRoles(function (response) {
        roles = response;
      });
      return cb();
    });

  };

  $scope.loadRoles = function(query) {
    var filteredRoles = _.filter(roles, function (role) { return role.indexOf(query) > -1; })
    return filteredRoles;
  }

  $scope.pushChangedUser = function(user) {
    user.roles = _.pluck(user.roles, 'text');
    cdUsersService.update(user, function (response) {
    }, function (err) {
      alertService.showError('Error updating user: ' + err);
    });
  }

  $scope.inviteMentor = function (invite, context) {
    usSpinnerService.spin('manage-dojo-users-spinner');
    cdDojoService.generateMentorInviteToken({email:invite.email, dojoId:dojoId}, function (response) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      alertService.showAlert('Invite Sent!');
      context.inviteMentorForm.reset();
    }, function (err) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      alertService.showError('Error sending invite: ' + err);
    }); 
  }

  $scope.loadPage(true);

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', 'cdDojoService', 'cdUsersService', 'alertService', 'tableUtils', 'usSpinnerService', cdManageDojoUsersCtrl]);

