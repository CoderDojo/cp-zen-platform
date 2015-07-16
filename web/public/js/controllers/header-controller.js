'use strict';

function headerCtrl($window, $scope, $localStorage , intercomService) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
    if (!$scope.user) return false;
  	return _.contains($scope.user.roles, 'cdf-admin');
  };

  $scope.selectTab = function (tab) {
    $localStorage.selectedTab = tab;
  }

  $scope.isSelected = function (tab) {
    if ($localStorage.selectedTab === tab) return true;
    else return false;
  }

  intercomService.InitIntercom();

  $scope.selectedTab = $localStorage.selectedTab;
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', '$localStorage', 'intercomService', headerCtrl]);
