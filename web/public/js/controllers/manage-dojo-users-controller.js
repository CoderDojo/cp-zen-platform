'use strict';

function cdManageDojoUsersCtrl($scope, $state, auth, $q, cdDojoService, alertService, tableUtils, usSpinnerService, cdBadgesService, $translate) {
  var dojoId = $state.params.id;
  var usersDojosLink = [];
  $scope.itemsPerPage = 10;
  $scope.userTypes = [];
  $scope.userPermissions = [];
  $scope.selectedUserPermissions = {};
  $scope.canUpdateUserPermissions = false;
  $scope.canRemoveUsers = false;
  $scope.userPermissionsModel = {};
  $scope.isDojoAdmin = false;
  $scope.badgeModel = {};
  $scope.awardBadgeButtonModel = {};
  $scope.manageDojoUsersPageTitle = $translate.instant('Manage Dojo Users');
  
  auth.get_loggedin_user(function (user) {
    $scope.currentUser = user;
    //Updating user permissions and user types require the same permissions.
    //Remove users also requires the same permissions,
    //therefore we can check if the user can update user permissions & delete users by checking the result from the
    //canUpdateUser method.
    canUpdateUser(function (result) {
      $scope.canUpdateUserPermissions = result;
      $scope.canRemoveUsers = result;
    });
  });

  cdBadgesService.listBadges(function (response) {
    $scope.badges = response.badges;
  });

  $scope.pageChanged = function () {
    $scope.loadPage(false);
  };

  $scope.loadPage = function(resetFlag, cb) {
    cb = cb || function(){};

    var loadPageData = tableUtils.loadPage(resetFlag, $scope.itemsPerPage, $scope.pageNo, $scope.filterQuery, $scope.sort);
    $scope.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];
    var query = {dojoId:dojoId, limit$: $scope.itemsPerPage, skip$: loadPageData.skip};

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
    //TODO: search for dojo users using elastic search.
    cdDojoService.loadDojoUsers(query, function (response) {
      _.each(response, function (user) {
        var thisUsersDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        user.types = thisUsersDojoLink.userTypes;
        user.permissions = thisUsersDojoLink.userPermissions;
        user.isMentor = _.contains(user.types, 'mentor');
        user.backgroundChecked = thisUsersDojoLink.backgroundChecked;
        user.userDojoId = thisUsersDojoLink.id;
        $scope.selectedUserPermissions[user.id] = user.permissions;
        $scope.userPermissionsModel[user.id] = {};

        _.each(user.permissions, function (permission) {
          $scope.userPermissionsModel[user.id][permission.name] = true;
        });

      });
      $scope.users = response;
      //Query the loadDojoUsers service without the limit to get the total number of users.
      cdDojoService.loadDojoUsers({dojoId: dojoId}, function (response) {
        $scope.totalItems = response.length;
      });
      return cb();
    });

  };

  $scope.updateMentorBackgroundCheck = function (user) {
    var userDojo = {
      id: user.userDojoId,
      backgroundChecked: user.backgroundChecked
    };

    cdDojoService.saveUsersDojos(userDojo, null, function (err) {
      alertService.showError(JSON.stringify(err));
    });
  }

  $scope.updateUserPermissions = function(user, permission) {
    var hasPermission = false;
    canUpdateUser(function (result) {
      hasPermission = result;
      if (hasPermission) {
        var query = {dojoId:dojoId};
        delete permission.$$hashKey;
        var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        if($scope.userPermissionsModel[user.id][permission.name]) {
          //Add to user permissions
          if(!userDojoLink.userPermissions) userDojoLink.userPermissions = [];
          userDojoLink.userPermissions.push(permission);
          //Save to db
          if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0].text) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
          cdDojoService.saveUsersDojos(userDojoLink, null, function (err) {
            alertService.showError($translate.instant('Error saving permission') + ' ' + err);
            //Revert checkbox 
            $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
          });
        } else {
          //Remove from user permissions
          var indexToRemove;
          _.find(user.permissions, function(userPermission, userPermissionIndex){
            indexToRemove = userPermissionIndex;
            return _.isEqual(userPermission, permission);
          });
          user.permissions.splice(indexToRemove, 1);
          userDojoLink.userPermissions = user.permissions;
          if(userDojoLink.userTypes[0] && userDojoLink.userTypes[0].text) userDojoLink.userTypes = _.pluck(userDojoLink.userTypes, 'text');
          //Save to db
          cdDojoService.saveUsersDojos(userDojoLink, function (response) {
            if(response.error)  {
              alertService.showError($translate.instant(response.error));
              //Revert checkbox
              $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
              //Re-add permission
              user.permissions.push(permission);
            }
          }, function (err) {
            alertService.showError($translate.instant('Error removing permission') + ' ' +err);
            //Revert checkbox 
            $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
          });
        }
      } else {
        alertService.showAlert($translate.instant('You do not have permission to update user permissions'));
        //Revert checkbox 
        $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
      }
    });
  }

  $scope.loadUserTypes = function(query) {
    var filteredUserTypes = _.filter($scope.userTypes, function (userType) { return userType.indexOf(query) > -1; })
    return filteredUserTypes;
  }

  $scope.pushChangedUser = function(user, method, $tag) {
    var hasPermission = false;
    canUpdateUser(function (result) {
      hasPermission = result;

      if(hasPermission) {

        user.types = _.pluck(user.types, 'text');
        var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        if(!userDojoLink.userTypes) userDojoLink.userTypes = [];
        userDojoLink.userTypes = user.types;
        cdDojoService.saveUsersDojos(userDojoLink, function (response) {
          if(response.error) { 
            alertService.showError($translate.instant(response.error));
            //Revert user types
            if(method === 'add') user.types.pop();
            if(method === 'remove') user.types.push($tag);
          }
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

  function canUpdateUser(cb) {
    //Can update user types if:
    // - Current user is champion
    // - Current user is Dojo Admin
    function getUsersDojos() {
      return $q(function (resolve, reject) {
        var query = {userId: $scope.currentUser.id, dojoId: dojoId};
        var isChampion;
        var isDojoAdmin;
        cdDojoService.getUsersDojos(query, function (response) {
          var userDojo = response[0];
          isChampion   = _.contains(userDojo.userTypes, 'champion');
          isDojoAdmin  = _.find(userDojo.userPermissions, function(userPermission) {
                          return userPermission.name === 'dojo-admin';
                        });
          if(isDojoAdmin) $scope.isDojoAdmin = true;
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
        if(response.error) {
          alertService.showError($translate.instant(response.error));
        }
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

  $scope.badgeSelected = function (user) {
    $scope.awardBadgeButtonModel[user.id] = true;
    $scope.$watch('badgeModel', function (val) {
      if(!val[user.id]) $scope.awardBadgeButtonModel[user.id] = false;
    });
  }

  $scope.awardBadge = function (user, badge) {
    usSpinnerService.spin('manage-dojo-users-spinner');
    var applicationData = {
      user: user,
      badge: badge
    };

    cdBadgesService.sendBadgeApplication(applicationData, function (response) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      if(response.error) return alertService.showError($translate.instant(response.error));
      alertService.showAlert($translate.instant('Badge Application Sent!'));
    });
  }

  $scope.loadPage(true);

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', 'auth', '$q', 'cdDojoService', 'alertService', 'tableUtils', 'usSpinnerService', 'cdBadgesService', '$translate' ,cdManageDojoUsersCtrl]);

