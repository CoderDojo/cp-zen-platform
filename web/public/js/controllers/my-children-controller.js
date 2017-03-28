/* global _, angular */

'use strict';

function myChildrenCtrl ($scope, $state, $translate, ownProfile, cdUsersService) {
  $scope.parentProfileData = ownProfile.data;
  $scope.tabs = [];

  function loadChildrenTabs () {
    $scope.tabs = [];
    cdUsersService.loadChildrenForUser($scope.parentProfileData.userId, function (children) {
      $scope.children = _.sortBy(children, [
        function (child) {
          return child.name.toLowerCase();
        }
      ]);

      $scope.tabs = $scope.children.map(function (child) {
        return {
          state: 'my-children.child',
          stateParams: {id: child.userId},
          tabImage: '/api/2.0/profiles/' + child.id + '/avatar_img',
          tabTitle: child.name,
          tabSubTitle: child.alias
        };
      });

      $scope.tabs.push({
        state: 'my-children.add',
        tabImage: '/img/avatars/avatar.png',
        tabTitle: $translate.instant('Add Child')
      });
    });
  }

  loadChildrenTabs();

  $scope.$on('$stateChangeStart', function (e, toState, params) {
    if (toState.name === 'my-children.child') {
      var childLoaded = _.some($scope.children, function (child) {
        return child.userId === params.id;
      });
      if (!childLoaded) {
        loadChildrenTabs();
      }
    }
  });
}

angular.module('cpZenPlatform')
  .controller('my-children-controller', ['$scope', '$state', '$translate', 'ownProfile', 'cdUsersService', myChildrenCtrl]);
