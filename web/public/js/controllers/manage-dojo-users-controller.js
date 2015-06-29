'use strict';

function cdManageDojoUsersCtrl($scope, $state, auth, $q, cdDojoService, alertService, tableUtils, usSpinnerService, $translate) {
  var dojoId = $state.params.id;
  var usersDojosLink = [];
  var currentUser;
  $scope.itemsPerPage = 10;
  $scope.userTypes = [];
  $scope.userPermissions = [];
  $scope.selectedUserPermissions = {};
  $scope.canUpdateUserPermissions = false;
  $scope.canRemoveUsers = false;

  auth.get_loggedin_user(function (user) {
    currentUser = user;
    //Updating user permissions and user types require the same permissions.
    //Remove users also requires the same permissions,
    //therefore we can check if the user can update user permissions & delete users by checking the result from the
    //canUpdateUserTypes method.
    canUpdateUserTypes(function (result) {
      $scope.canUpdateUserPermissions = result;
      $scope.canRemoveUsers = result;
    });
  });

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
      var mentorUserTypes   = ['mentor', 'parent-guardian', 'attendee-o13'];
      var parentUserTypes   = ['parent-guardian', 'attendee-o13'];
      var attendeeUserTypes = ['attendee-o13'];

      auth.get_loggedin_user(function (user) {
        var query = {userId: user.id, dojoId: dojoId};
        cdDojoService.getUsersDojos(query, function (usersDojos) {
          var userDojo = usersDojos[0]
          user.userTypes = userDojo.userTypes;
          user.userPermissions = userDojo.userPermissions;
          if(_.contains(user.userTypes, 'champion')) {
            $scope.userTypes = response;
          } else if(_.contains(user.userTypes, 'mentor')) {
            response.splice(3, 1); //Mentors shouldn't be able to invite champions
          } else if(_.contains(user.userTypes, 'parent-guardian')) {
            response.splice(2, 2);
          } else if(_.contains(user.userTypes, 'attendee-o13')) {
            response.splice(1, 3);
          } else {
            response = [];
          }
          $scope.userTypes = response;
        });
      });
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
    if($scope.canUpdateUserPermissions) {
      var query = {dojoId:dojoId};
      delete permission.$$hashKey;
      var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
      if(!$scope.userHasPermission(user, permission)) {
        //Add to user permissions
        if(!userDojoLink.userPermissions) userDojoLink.userPermissions = [];
        userDojoLink.userPermissions.push(permission);
        //Save to db
        if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0].text) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
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
        if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0].text) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
        //Save to db
        cdDojoService.saveUsersDojos(userDojoLink, function (response) {

        }, function (err) {
          alertService.showError($translate.instant('Error removing permission') + ' ' +err);
        });
      }
    } else {
      alertService.showAlert($translate.instant('You do not have permission to update user permissions'));
    }


  }

  $scope.loadUserTypes = function(query) {
    var filteredUserTypes = _.filter($scope.userTypes, function (userType) { return userType.indexOf(query) > -1; })
    return filteredUserTypes;
  }

  $scope.pushChangedUser = function(user, method, $tag) {
    var hasPermission = false;
    canUpdateUserTypes(function (result) {
      hasPermission = result;

      if(hasPermission) {

        user.types = _.pluck(user.types, 'text');
        var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        if(!userDojoLink.userTypes) userDojoLink.userTypes = [];
        userDojoLink.userTypes = user.types;
        cdDojoService.saveUsersDojos(userDojoLink, function (response) {
        }, function (err) {
          alertService.showError($translate.instant('Error saving user type') + ' ' + err);
        });
      } else {
        alertService.showAlert($translate.instant('You do not have permission to update user types'));
        if(method === 'add') user.types.pop();
        if(method === 'remove') user.types.push($tag);
      }
    });
  }

  function canUpdateUserTypes(cb) {
    //Can update user types if:
    // - Current user is champion
    // - Current user is Dojo Admin
    function getUsersDojos() {
      return $q(function (resolve, reject) {
        var query = {userId: currentUser.id, dojoId: dojoId};
        var isChampion;
        var isDojoAdmin;
        cdDojoService.getUsersDojos(query, function (response) {
          var userDojo = response[0];
          isChampion   = _.contains(userDojo.userTypes, 'champion');
          isDojoAdmin  = _.find(userDojo.userPermissions, function(userPermission) {
                          return userPermission.name === 'dojo-admin';
                        });
          if(isChampion && isDojoAdmin) return resolve(true);
          return resolve(false);
        }, function (err) {
          alertService.showError($translate.instant('Error loading user dojo entity') + ' <br /> ' +
          (err.error || JSON.stringify(err)));
        });
      });
    }

    getUsersDojos().then(function (result) {
      cb(result);
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
    if($scope.canRemoveUsers) {
      usSpinnerService.spin('manage-dojo-users-spinner');
      var userId = user.id;
      cdDojoService.removeUsersDojosLink(userId, dojoId, function (response) {
        usSpinnerService.stop('manage-dojo-users-spinner');
        $scope.loadPage(true);
      }, function (err) {
        usSpinnerService.stop('manage-dojo-users-spinner');
        alertService.showError($translate.instant('Error removing user') + ' ' + err);
      });
    } else {
      alertService.showAlert($translate.instant('You do not have permission to remove users'));
    }
  }

  $scope.loadPage(true);

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', 'auth', '$q', 'cdDojoService', 'alertService', 'tableUtils', 'usSpinnerService', '$translate' ,cdManageDojoUsersCtrl]);

