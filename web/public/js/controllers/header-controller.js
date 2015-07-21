'use strict';

function headerCtrl($window, $scope, $localStorage, $location, intercomService) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };

  $scope.userIsCDFAdmin = function () {
    if (!$scope.user) return false;
  	return _.contains($scope.user.roles, 'cdf-admin');
  };

  $scope.isSelected = function (tab) {
    var path = $location.path();
    if (tab === 'my-dojos' && path.indexOf('edit-dojo') > -1) return true;
    if (tab === 'events' && path.indexOf('my-dojos') > -1) return false;
    if (tab === 'dojo-list' && path === '/') return true;
    if (path.indexOf(tab) > -1) return true
    else return false;
  }
  
  intercomService.InitIntercom();
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', '$localStorage', '$location', 'intercomService', headerCtrl]);
