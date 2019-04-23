;(function() {
  'use strict';

  angular
    .module('cpZenPlatform')
    .directive('cdDojoManagePendingUsers', function () {
      return {
        restrict: 'AE',
        templateUrl: '/directives/tpl/dojo/manage-pending-users',
        scope: {
          initUserTypes: '='
        },
        controller: ['cdDojoService', '$state', 'userUtils', '$scope', 'cdUsersService', '$q',
        'usSpinnerService', 'atomicNotifyService', '$translate', 'alertService', 'translationKeys',
        function (cdDojoService, $state, userUtils, $scope, cdUsersService, $q,
          usSpinnerService, atomicNotifyService, $translate, alertService, translationKeys) {
          var ctrl = this;
          $scope.actionBarConfig = {
            forceFixed: false,
            overflowOpen: false
          };
          $scope.showActionBar = false;
          $scope.$watch('selectedItems.length', function (newValue) {
            $scope.showActionBar = newValue > 0;
          });
          $scope.filter = {};
          $scope.filterUserTypes = angular.copy($scope.initUserTypes.data);
          var dojoId = $state.params.id;

          $scope.filterUsers = function (filter, context) {
            var query = {};
            if (filter.userType) {
              query.userType = filter.userType.name;
            }
            if (filter.name) {
              query.name = filter.name;
            }
            $scope.loadData(query);
          };

          $scope.loadData = function (query) {
            usSpinnerService.spin('manage-dojo-users-spinner');
            return cdDojoService.searchDojoInvites(dojoId, query || {})
            .then(function (invites) {
              $scope.invites = invites.data;
            })
            .then(function () {
              $scope.pendingUsers = $scope.invites.map(function (invite) {
                var user = invite.userData;
                return {
                  userData: user,
                  invite: invite,
                  picture: '/api/2.0/profiles/' + user.profileId + '/avatar_img',
                  caption: user.name,
                  subCaption: userUtils.getTitleForUserTypes(invite.userType, user)
                };
              });
              usSpinnerService.stop('manage-dojo-users-spinner');
            });
          };

          $scope.loadData();
          $scope.actions = {
            viewProfile: {
              ngShow: function () {
                return $scope.selectedItems.length === 1;
              },
              ngHref: function () {
                var users = $scope.selectedItems;
                // Need to check as ngHref is called before selection, so $scope.selectedItems[0] can be undefined
                if (users.length === 1) {
                  return '/profile/' + $scope.selectedItems[0].userData.userId;
                }
              }
            },
            decline: {
              ngShow: function () {
                return $scope.selectedItems.length === 1;
              },
              ngClick: function () {
                usSpinnerService.spin('manage-dojo-users-spinner');
                cdDojoService.declineUserRequest(dojoId, $scope.selectedItems[0].invite.id, $scope.selectedItems[0].userData.userId)
                .then(function (res) {
                  if (res.data.error) {
                    throw res.data.error;
                  } else {
                    return $scope.loadData();
                  }
                })
                .then(function () {
                  usSpinnerService.stop('manage-dojo-users-spinner');
                  atomicNotifyService.success($translate.instant(translationKeys.DECLINE_JOIN_REQUEST));
                })
                .catch(function (err) {
                  usSpinnerService.stop('manage-dojo-users-spinner');
                  alertService.showError($translate.instant(translationKeys.ERROR_DECLINE_JOIN_REQUEST) + JSON.stringify(err));
                });
              }
            },
            accept: {
              ngShow: function () {
                return $scope.selectedItems.length === 1;
              },
              ngClick: function () {
                usSpinnerService.spin('manage-dojo-users-spinner');
                cdDojoService.acceptUserRequest(dojoId, $scope.selectedItems[0].invite.id, $scope.selectedItems[0].userData.userId)
                .then(function (res) {
                  if (res.data.error) {
                    throw res.data.error;
                  } else {
                    return $scope.loadData();
                  }
                })
                .then(function () {
                  atomicNotifyService.success($translate.instant(translationKeys.ACCEPT_JOIN_REQUEST));
                  usSpinnerService.stop('manage-dojo-users-spinner');
                })
                .catch(function (err) {
                  usSpinnerService.stop('manage-dojo-users-spinner');
                  if(err.status === 400) {
                    alertService.showError($translate.instant('This user is already part of your Dojo, change tab to modify the user\'s role.'));
                  } else {
                    alertService.showError($translate.instant(translationKeys.ERROR_ACCEPT_JOIN_REQUEST) + JSON.stringify(err));
                  }
                });
              }
            }
          };
        }]
      };
    });
}());
