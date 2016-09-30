;(function() {
  'use strict';

function cdReset(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-reset',
      controller: 'login'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdReset', cdReset)
}());
