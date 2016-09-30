;(function() {
  'use strict';

function cdRegisterProfile(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-register-profile',
      controller: 'login',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegisterProfile', cdRegisterProfile)
}());
