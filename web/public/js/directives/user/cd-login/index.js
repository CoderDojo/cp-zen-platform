;(function() {
  'use strict';

function cdLogin(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-login',
      link: function (scope, element, attrs) {
      },
      controller: 'login'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdLogin', cdLogin)
}());
