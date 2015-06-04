'use strict';

function cdManageDojoUsersCtrl($scope, $state, cdDojoService, alertService, tableUtils, usSpinnerService, $translate) {
  var dojoId = $state.params.id;
  var usersDojosLink = [];
  $scope.itemsPerPage = 10;
  $scope.userTypes = [];
  $scope.userPermissions = [];
  $scope.selectedUserPermissions = {};

  $scope.pageChanged = function () {
    $scope.loadPage(false);
  };

  $scope.loadPage = function(resetFlag, cb) {
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
    $scope.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];
    var query = {dojoId:dojoId};

    cdDojoService.getUserTypes(function (response) {
      $scope.userTypes = response;
    });

    cdDojoService.getUserPermissions(function (response) {
      $scope.userPermissions = response;
    });

    cdDojoService.getUsersDojos(query, function (response) {
      usersDojosLink = response;
    });

    cdDojoService.loadDojoUsers(query, function (response) {
      _.each(response, function (user) {
        var thisUsersDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        user.types = thisUsersDojoLink.userTypes;
        user.permissions = thisUsersDojoLink.userPermissions;       
        $scope.selectedUserPermissions[user.id] = user.permissions;
      });
      $scope.users = response;
      $scope.totalItems = response.length;
      return cb();
    });

  };

  $scope.userHasPermission = function(user, permission) {
    var permissionFound = _.findWhere($scope.selectedUserPermissions[user.id], {name:permission.name});
    if(permissionFound) return true;
    return false;
  }

  $scope.updateUserPermissions = function(user, permission) {
    var query = {dojoId:dojoId};
    delete permission.$$hashKey;
    var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
    if(!$scope.userHasPermission(user, permission)) {
      //Add to user permissions
      if(!userDojoLink.userPermissions) userDojoLink.userPermissions = [];
      userDojoLink.userPermissions.push(permission);
      //Save to db
      if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0]['text']) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
      cdDojoService.saveUsersDojos(userDojoLink, function (response) {
        
      }, function (err) {
        alertService.showError($translate.instant('Error saving permission') + ' ' + err);
      });
    } else {
      //Remove from user permissions
      var indexToRemove;
      _.find(user.permissions, function(userPermission, userPermissionIndex){
        if(_.isEqual(userPermission, permission)) {
          return indexToRemove = userPermissionIndex;
        }
      });
      user.permissions.splice(indexToRemove, 1);
      userDojoLink.userPermissions = user.permissions;
      if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0]['text']) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
      //Save to db
      cdDojoService.saveUsersDojos(userDojoLink, function (response) {

      }, function (err) {
        alertService.showError($translate.instant('Error removing permission') + ' ' +err);
      });
    }

  }

  $scope.loadUserTypes = function(query) {
    var filteredUserTypes = _.filter($scope.userTypes, function (userType) { return userType.indexOf(query) > -1; })
    return filteredUserTypes;
  }

  $scope.pushChangedUser = function(user) {
    user.types = _.pluck(user.types, 'text');
    var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
    if(!userDojoLink.userTypes) userDojoLink.userTypes = [];
    userDojoLink.userTypes = user.types;
    cdDojoService.saveUsersDojos(userDojoLink, function (response) {

    }, function (err) {
      alertService.showError($translate.instant('Error saving user type') + ' ' + err);
    });
  }

  $scope.inviteUser = function (invite, context) {
    usSpinnerService.spin('manage-dojo-users-spinner');
    cdDojoService.generateUserInviteToken({email:invite.email, userType:invite.userType, dojoId:dojoId}, function (response) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      alertService.showAlert($translate.instant('Invite Sent'));
      context.inviteMentorForm.reset();
    }, function (err) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      alertService.showError($translate.instant('Error sending invite') + ' ' + err);
    }); 
  }

  $scope.removeUser = function (user) {
    var userId = user.id;
    cdDojoService.removeUsersDojosLink(userId, dojoId, function (response) {
      $scope.loadPage(true);
    }, function (err) {
      alertService.showError($translate.instant('Error removing user') + ' ' + err);
    });
  }

  $scope.loadPage(true);

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', 'cdDojoService', 'alertService', 'tableUtils', 'usSpinnerService', '$translate' ,cdManageDojoUsersCtrl]);

