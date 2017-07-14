;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfLogin = function(){
  return {
    restrict: 'E',
    templateUrl: '/directives/tpl/user/cd-login',
    controller: ['$scope', 'auth', '$window', '$translate', '$state', function ($scope, auth, $window, $translate, $state) {
      $scope.noop = angular.noop;
      var refererUrl = $state.params.referer || $state.params.next;
      $scope.referer = refererUrl ? decodeURIComponent(refererUrl) : refererUrl;
      $scope.login = {};

      $scope.doLogin = function () {
        $scope.message = '';
        $scope.errorMessage = '';

        if (!$scope.loginForm.$valid) {
          return;
        }

        auth.cdfLogin($scope.login,
          function (data) {
            if (data.ok) {
              // User Login
              var user = data.user;
              if (_.includes(user.roles, 'cdf-admin')) {
                if (!$scope.referer && !$scope.next) {
                  //  TODO: dashboard for cdf
                  $scope.referer = $state.href('dashboard');
                }
                $window.location.href = $scope.referer || $scope.next;
              }
            }
          },
          function(){
            // Near silence is golden
            $scope.errorMessage = $translate.instant('Invalid email or password');
          }
        );
      };
    }]
  };
}

angular
    .module('cpZenPlatform')
    .directive('cdfLogin', cdfLogin);
}());
