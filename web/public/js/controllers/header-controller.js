'use strict';

function headerCtrl($window, $scope, $location, $state, intercomService, auth) {

  var currentUser;
  auth.get_loggedin_user(function (user) {
    currentUser = user;
  });

  var stateUrls = {
    //dashboard states
    'my-dojos': '/dashboard/my-dojos',
    'user-events': '/dashboard/dojos/events/user-events',
    'badges-dashboard': '/dashboard/badges',
    'dojo-list': '/dashboard/dojo-list',
    'manage-dojos': '/dashboard/manage-dojos',
    'stats':'/dashboard/stats',

    //master states
    'home': '/',
    'login': '/login',
    'register-account':'/register',
    'start-dojo': '/start-dojo',
    'charter': '/charter'
  };

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
    return path.indexOf(tab) > -1;
  };

  $scope.goToCharter = function () {
    if (!currentUser) {
      $scope.goTo('charter');
    } else {
      $scope.goTo('charter-page');
    }
  };

  $scope.goTo = function (state) {
    if($state.current.url === '^'){
      $window.location.href = stateUrls[state];
    } else {
      if (currentUser && !_.contains($location.path(), '/dashboard') && $state.current.url !== '/') {
        $window.location.href = stateUrls[state];
      } else {
        $state.go(state);
      }
    }
  };

  intercomService.InitIntercom();
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', '$location', '$state', 'intercomService', 'auth', headerCtrl]);
