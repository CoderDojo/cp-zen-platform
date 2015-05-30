'use strict';

function headerCtrl($window, $scope, cdDojoService) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
  	if(_.contains($scope.user.roles, 'cdf-admin')) return true;
  	return false;
  }
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', 'cdDojoService', headerCtrl]);
