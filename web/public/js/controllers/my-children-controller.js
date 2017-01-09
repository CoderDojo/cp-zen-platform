'use strict';

function myChildrenCtrl($scope, ownProfile) {
  $scope.parentProfileData = ownProfile.data;

  $scope.children = _.sortBy(ownProfile.data.resolvedChildren, [function (child) {
    return child.name.toLowerCase();
  }]);

  $scope.tabs = $scope.children.map(function (child) {
    return {
      state: 'my-children.child',
      stateParams: {id: child.userId},
      tabImage: '/api/2.0/profiles/' + child.id + '/avatar_img',
      tabTitle: child.name,
      tabSubTitle: child.alias
    };
  });
}

angular.module('cpZenPlatform')
  .controller('my-children-controller', ['$scope', 'ownProfile', myChildrenCtrl]);
