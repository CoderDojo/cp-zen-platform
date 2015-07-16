'use strict';

function headerCtrl($window, $scope, $localStorage , intercomService) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
    if (!$scope.user) return false;
  	return _.contains($scope.user.roles, 'cdf-admin');
  };

  $scope.isSelected = function (tab) {
    if (tab === 'my-dojos' && $window.location.pathname.indexOf('edit-dojo') > -1) return true;
    if (tab === 'events' && $window.location.pathname.indexOf('my-dojos') > -1) return false;
    if (tab === 'dojo-list' && $window.location.pathname === '/') return true;
    if ($window.location.pathname.indexOf(tab) > -1) return true
    else return false;
  }

  intercomService.InitIntercom();
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', '$localStorage', 'intercomService', headerCtrl]);
