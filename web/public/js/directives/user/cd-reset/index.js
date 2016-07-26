;(function() {
  'use strict';

function cdReset(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-reset',
      link: function (scope, element, attrs) {
      },
      controller: 'login'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdReset', cdReset)
}());
