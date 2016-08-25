;(function() {
  'use strict';

function cdRegisterUser(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: '/directives/tpl/user/cd-register-user',
      controller: [ '$scope', 'utilsService', '$translate', function($scope, utilsService, $translate) {
        $scope.validatePassword = function (password, email) {
          var validationResult = utilsService.validatePassword(password, email);
          if(!validationResult.valid) $scope.invalidPasswordMessage = $translate.instant(validationResult.msg);
          return validationResult.valid;
        }

        $scope.matchesPassword = function(password, passwordConfirm) {
          if(passwordConfirm !== password) {
            $scope.invalidConfirmPasswordMessage = $translate.instant('Passwords do not match');
            return false;
          }
          return true;
        }
      }]
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegisterUser', cdRegisterUser)
}());
