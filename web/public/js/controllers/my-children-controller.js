'use strict';

function myChildrenCtrl($scope, ownProfile) {
  $scope.parentProfileData = ownProfile.data;

  $scope.children = ownProfile.data.resolvedChildren.sort(function (child1, child2) {
    var n1 = child1.name.toLowerCase();
    var n2 = child2.name.toLowerCase();
    if (n1 < n2) {
      return -1;
    } else if (n1 > n2) {
      return 1;
    } else {
      return 0;
    }
  });

  $scope.tabs = $scope.children.map(function (child) {
    return {
      state: 'my-children.child',
      stateParams: {id: child.userId},
      tabImage: '/api/2.0/profiles/' + child.id + '/avatar_img',
      tabTitle: child.name,
      tabSubTitle: child.alias,
      searchParams: {
        id: child.userId
      }
    };
  });
}

angular.module('cpZenPlatform')
  .controller('my-children-controller', ['$scope', 'ownProfile', myChildrenCtrl]);
