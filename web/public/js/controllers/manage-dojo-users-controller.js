 'use strict';

function cdManageDojoUsersCtrl($scope, $state, cdDojoService, alertService, tableUtils) {
  var dojoId = $state.params.id;
  $scope.itemsPerPage = 1;

  $scope.pageChanged = function () {
    $scope.loadPage(false);
  };

  $scope.loadPage = function(resetFlag, cb) {
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
    $scope.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];

    cdDojoService.loadDojoUsers(dojoId, function (response) {
      _.each(response, function(user) {
        user.roles = user.roles.join();
      });
      $scope.users = response;
      $scope.totalItems = response.length;
      return cb();
    });

  };

  $scope.inviteMentor = function (invite, context) {
    cdDojoService.generateMentorInviteToken({email:invite.email, dojoId:dojoId}, function (response) {
      console.log('response = ' + JSON.stringify(response));
      alertService.showAlert('Invite Sent!');
      context.inviteMentorForm.reset();
    }); 
  }

  $scope.loadPage(true);

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', 'cdDojoService', 'alertService', 'tableUtils', cdManageDojoUsersCtrl]);