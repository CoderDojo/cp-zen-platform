;(function() {
  'use strict';

function cdCreateDojo(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-create-dojo-template.html',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdCreateDojo', cdCreateDojo)
 
}());