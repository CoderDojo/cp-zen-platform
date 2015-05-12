;(function() {
  'use strict';

function cdCharter(){
    return {
      restrict: 'E',
      templateUrl: '/charter/template/index',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdCharter', cdCharter)
 
}());