'use strict';

function headerCtrl($window, $scope, cdDojoService, $localStorage) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
  	if(_.contains($scope.user.roles, 'cdf-admin')) return true;
  	return false;
  }

  $scope.selectTab = function (tab) {
    $localStorage.selectedTab = tab;
  }

  $scope.isSelected = function (tab) {
    if ($localStorage.selectedTab === tab) return true;
    else return false;
  }

  $scope.selectedTab = $localStorage.selectedTab;
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', 'cdDojoService', '$localStorage', headerCtrl]);
