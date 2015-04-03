;(function() {
  'use strict';
  
  function cdCharter(){
    return {
      restrict: 'E',
      templateUrl: '/content/charter/cd-charter-template.html',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

 angular
    .module('cpZenPlatform')
    .directive('cdCharter', cdCharter)
 
}());