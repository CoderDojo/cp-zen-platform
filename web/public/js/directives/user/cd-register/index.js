;(function() {
  'use strict';

function cdRegister(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-register',
      controller: 'login'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegister', cdRegister)
}());
