'use strict';

function addChildController($scope){
  $scope.profile = {
    ownProfileFlag: true
  };
};

angular.module('cpZenPlatform')
  .controller('add-child-controller',['$scope', addChildController]);