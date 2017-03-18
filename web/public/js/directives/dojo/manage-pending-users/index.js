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
        'usSpinnerService', 'atomicNotifyService', '$translate',
        function (cdDojoService, $state, userUtils, $scope, cdUsersService, $q, usSpinnerService, atomicNotifyService, $translate) {
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
                  subCaption: userUtils.getTitleForUserTypes(user.types, user)
                };
              });
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
                var tokenData = {
                  requestedByUser: $scope.selectedItems[0].userData.userId,
                  inviteToken: $scope.selectedItems[0].invite.id
                };
                cdDojoService.acceptUserRequest(tokenData)
                .then(function () {
                  return $scope.loadData();
                })
                .then(function () {
                  usSpinnerService.stop('manage-dojo-users-spinner');
                  atomicNotifyService.success($translate.instant('User successfully removed from your dojo'));
                });
              }
            },
            accept: {
              ngShow: function () {
                return $scope.selectedItems.length === 1;
              },
              ngClick: function () {
                usSpinnerService.spin('manage-dojo-users-spinner');
                var tokenData = {
                  requestedByUser: $scope.selectedItems[0].userData.userId,
                  inviteToken: $scope.selectedItems[0].invite.id
                };
                cdDojoService.acceptUserRequest(tokenData)
                .then(function () {
                  return $scope.loadData();
                })
                .then(function () {
                  atomicNotifyService.success($translate.instant('User successfully added to your dojo'));
                  usSpinnerService.stop('manage-dojo-users-spinner');
                });
              }
            }
          };
        }]
      };
    });
}());
