'use strict';

function cdManageDojoUsersCtrl($scope, $state, $q, cdDojoService, alertService, tableUtils, usSpinnerService,
  cdBadgesService, $translate, initUserTypes, currentUser, utilsService, cdEventsService) {

  var dojoId = $state.params.id;
  var usersDojosLink = [];
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
  $scope.invite = {};
  $scope.queryModel = {};
  $scope.pagination = {itemsPerPage: 10};

  initUserTypes.data = _.map(initUserTypes.data, function(userType){
    userType.title = $translate.instant(userType.title);
    return userType;
  });

  var user = currentUser.data;
  $scope.currentUser = user;
  //Show 404 if current user has no permission to view this page
  cdDojoService.getUsersDojos({userId: $scope.currentUser.id, deleted: 0, dojoId: dojoId}, function (usersDojos) {
    var userDojo = usersDojos[0];
    var isDojoAdmin;
    if(userDojo) {
      isDojoAdmin = _.find(userDojo.userPermissions, function (userPermission) {
        return userPermission.name === 'dojo-admin';
      });
    }

    if(!userDojo || !isDojoAdmin) return $state.go('error-404-no-headers');
    $scope.loadPage(true);
  });

  //Updating user permissions and user types require the same permissions.
  //Remove users also requires the same permissions,
  //therefore we can check if the user can update user permissions & delete users by checking the result from the
  //canUpdateUser method.
  canUpdateUser(function (result) {
    $scope.canUpdateUserPermissions = result;
    $scope.canRemoveUsers = result;
  });

  cdBadgesService.listBadges(function (response) {
    $scope.badges = response.badges;
  });

  $scope.pageChanged = function () {
    $scope.loadPage(false);
  };

  $scope.loadPage = function(resetFlag) {
    $scope.queryModel.sort = $scope.queryModel.sort ? $scope.queryModel.sort: {name: 1};
    var loadPageData = tableUtils.loadPage(resetFlag, $scope.pagination.itemsPerPage, $scope.pagination.pageNo, $scope.filterQuery, $scope.queryModel.sort);
    $scope.pagination.pageNo = loadPageData.pageNo;
    $scope.myDojos = [];
    var users;

    async.series([
      getInviteUserTypes,
      getUsersDojosLink,
      loadDojoUsers,
      retrieveEventsAttended,
      getTotalCount
    ], function (err) {
      if(err) console.error(err);
      users = _.compact(users);
      $scope.users = users;
    });

    function getInviteUserTypes(done) {
      cdDojoService.getUsersDojos({userId: user.id, dojoId: dojoId, deleted: 0}, function (usersDojos) {
        if(!usersDojos || usersDojos.length < 1){
          $state.go('my-dojos');
          return done();
        }
        var userDojo = usersDojos[0];
        user.userTypes = userDojo.userTypes;
        var inviteUserTypes = angular.copy(initUserTypes.data);
        if(_.contains(user.userTypes, 'mentor')) {
          inviteUserTypes = _.without(inviteUserTypes, _.findWhere(inviteUserTypes, {name: 'champion'}));
        } else if(_.contains(user.userTypes, 'parent-guardian')) {
          inviteUserTypes = _.chain(inviteUserTypes)
            .without(_.findWhere(inviteUserTypes, {name: 'champion'}))
            .without(_.findWhere(inviteUserTypes, {name: 'mentor'}))
            .value();
        } else if(_.contains(user.userTypes, 'attendee-o13')) {
          $scope.userTypes = _.chain(inviteUserTypes)
            .without(_.findWhere(inviteUserTypes, {name: 'champion'}))
            .without(_.findWhere(inviteUserTypes, {name: 'mentor'}))
            .without(_.findWhere(inviteUserTypes, {name: 'parent-guardian'}))
            .value();
        } else if(_.contains(user.userTypes, 'attendee-u13')) {
          inviteUserTypes = [];
        }
        $scope.userTypes = inviteUserTypes;

        cdDojoService.getUserPermissions(function (response) {
          $scope.userPermissions = response;
          return done();
        });
      });
    }

    function getUsersDojosLink(done) {
      cdDojoService.getUsersDojos({dojoId:dojoId, deleted: 0, limit$: $scope.pagination.itemsPerPage, skip$: loadPageData.skip}, function (response) {
        usersDojosLink = response;
        return done();
      });
    }

    function loadDojoUsers(done) {
      cdDojoService.loadDojoUsers({dojoId:dojoId, limit$: $scope.pagination.itemsPerPage, skip$: loadPageData.skip, sort$: $scope.queryModel.sort}, function (response) {
        _.each(response, function (user) {
          var thisUsersDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
          user.types = thisUsersDojoLink.userTypes;
          user.frontEndTypes = _.map(thisUsersDojoLink.userTypes, function (userType) {
            var userTypeFound = _.find(initUserTypes.data, function (initUserType) {
              return userType === initUserType.name;
            });
            return $translate.instant(userTypeFound.title);
          });
          user.permissions = thisUsersDojoLink.userPermissions;
          user.isMentor = _.contains(user.types, 'mentor');
          user.isDojoOwner = thisUsersDojoLink.owner === 1;
          user.backgroundChecked = thisUsersDojoLink.backgroundChecked;
          user.userDojoId = thisUsersDojoLink.id;
          $scope.selectedUserPermissions[user.id] = user.permissions;
          $scope.userPermissionsModel[user.id] = {};

          _.each(user.permissions, function (permission) {
            $scope.userPermissionsModel[user.id][permission.name] = true;
          });
        });
        users = response;
        return done();
      });
    }

    function retrieveEventsAttended(done) {
      async.each(users, function (user, cb) {
        cdEventsService.searchApplications({dojoId:dojoId, userId: user.id}, function (applications) {
          _.each(applications, function (application) {
            if(application.attendance && application.attendance.length > 0) {
              if(!user.eventsAttended) user.eventsAttended = 0;
              if(application.ticketType !== 'other') user.eventsAttended += application.attendance.length;
            }
          });
          return cb();
        });
      }, done);
    }

    function getTotalCount(done) {
      //Query the loadDojoUsers service without the limit to get the total number of users.
      cdDojoService.loadDojoUsers({dojoId: dojoId, deleted: 0, limit$: 'NULL'}, function (response) {
        $scope.pagination.totalItems = response.length;
        return done();
      });
    }
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
          cdDojoService.saveUsersDojos(userDojoLink, function (response) {
            if(response.error) {
              alertService.showError($translate.instant(response.error));
              //Revert checkbox
              $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
            } else {
              alertService.showAlert($translate.instant('User permissions successfully updated.'));
            }
          }, function (err) {
            alertService.showError($translate.instant('Error saving permission') + ' ' + err);
            //Revert checkbox
            $scope.userPermissionsModel[user.id][permission.name] = !$scope.userPermissionsModel[user.id][permission.name];
          });
        } else {
          //Remove from user permissions
          user.permissions = _.without(user.permissions, _.findWhere(user.permissions, {name: permission.name}));
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
            } else {
              alertService.showAlert($translate.instant('User permissions successfully updated.'));
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
    var filteredUserTypes = _.chain(initUserTypes.data)
      .filter(function (userType) {
       return userType.title.toLowerCase().indexOf(query.toLowerCase()) > -1;
      })
      .map(function (userType) {
        return userType.title;
      })
      .value();

    return filteredUserTypes;
  }

  $scope.pushChangedUser = function(user, method, $tag) {
    var hasPermission = false;
    canUpdateUser(function (result) {
      hasPermission = result;

      if(hasPermission) {

        var updatedUserTypes = _.chain(angular.copy(user.frontEndTypes))
          .pluck('text')
          .map(function (userType) {
            userType = userType.replace(/-/g, ' ');
            var initUserTypeFound = _.find(initUserTypes.data, function (initUserType) {
              return initUserType.title === userType;
            });
            return initUserTypeFound.name;
          })
          .value();

        var userDojoLink = _.findWhere(usersDojosLink, {userId:user.id});
        if(!userDojoLink.userTypes) userDojoLink.userTypes = [];
        userDojoLink.userTypes = updatedUserTypes;
        cdDojoService.saveUsersDojos(userDojoLink, function (response) {
          if(response.error) {
            alertService.showError($translate.instant(response.error));
            //Revert user types
            if(method === 'add') user.frontEndTypes.pop();
            if(method === 'remove') user.frontEndTypes.push($tag);
          } else {
            alertService.showAlert($translate.instant('User types successfully updated.'));
          }
        }, function (err) {
          alertService.showError($translate.instant('Error saving user type') + ' ' + err);
        });
      } else {
        alertService.showAlert($translate.instant('You do not have permission to update user types'));
        if(method === 'add') user.frontEndTypes.pop();
        if(method === 'remove') user.frontEndTypes.push($tag);
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
    cdDojoService.generateUserInviteToken({email:invite.email, emailSubject: $translate.instant('New Dojo Invitation'), userType:invite.userType.name, dojoId:dojoId}, function (response) {
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
      cdDojoService.removeUsersDojosLink({userId: userId, dojoId: dojoId, emailSubject: $translate.instant('A user has left your Dojo')}, function (response) {
        if(response.error) {
          usSpinnerService.stop('manage-dojo-users-spinner');
          alertService.showError($translate.instant(response.error));
        } else {
          usSpinnerService.stop('manage-dojo-users-spinner');
          alertService.showAlert($translate.instant('User successfully removed from Dojo.'));
          $scope.loadPage(true);
        }
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
      badge: badge,
      emailSubject: $translate.instant('You have been awarded a new CoderDojo digital badge!')
    };

    cdBadgesService.sendBadgeApplication(applicationData, function (response) {
      usSpinnerService.stop('manage-dojo-users-spinner');
      if(response.error) return alertService.showError($translate.instant(response.error));
      alertService.showAlert($translate.instant('Badge Application Sent!'));
    });
  }

  $scope.toggleSort = function ($event, columnName) {
    var className, descFlag, sortConfig = {};
    var DOWN = 'glyphicon-chevron-down';
    var UP = 'glyphicon-chevron-up';

    function isDesc(className) {
      var result = className.indexOf(DOWN);
      return result > -1;
    }

    className = $($event.target).attr('class');

    descFlag = isDesc(className);
    if (descFlag) {
      sortConfig[columnName] = -1;
    } else {
      sortConfig[columnName] = 1;
    }

    $scope.queryModel.sort = sortConfig;
    $scope.loadPage($scope.filter, true);
  }

  $scope.getSortClass = utilsService.getSortClass;

}

angular.module('cpZenPlatform')
    .controller('manage-dojo-users-controller', ['$scope', '$state', '$q', 'cdDojoService', 'alertService', 'tableUtils', 'usSpinnerService',
    'cdBadgesService', '$translate', 'initUserTypes', 'currentUser', 'utilsService', 'cdEventsService', cdManageDojoUsersCtrl]);
