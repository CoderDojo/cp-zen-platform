;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfLogin = function(){
  return {
    restrict: 'E',
    templateUrl: '/directives/tpl/user/cd-login',
    controller: ['$scope', 'auth', '$window', '$translate', '$state', function ($scope, auth, $window, $translate, $state) {
      $scope.noop = angular.noop
      $scope.referer = $state.params.referer ? decodeURIComponent($state.params.referer) : $state.params.referer;
      $scope.login = {};

      $scope.doLogin = function() {
        $scope.message = '';
        $scope.errorMessage = '';

        if (!$scope.loginForm.$valid) {
          return;
        }

        auth.login($scope.login,
          function(data){
            if(data.ok) {
              // User Login
              var user = data.user;
              if(_.includes(user.roles, 'cdf-admin')){
                if (!$scope.referer) {
                  //  TODO: dashboard for cdf
                  $scope.referer = '/cdf/polls';
                }
                $window.location.href = $scope.referer;
              }
            }
          },
          function(){
            // Silence is golden
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
