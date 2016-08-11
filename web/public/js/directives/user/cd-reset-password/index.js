;(function() {
  'use strict';

function cdResetPassword(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-reset-password',
      controller: 'login'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdResetPassword', cdResetPassword)
}());
