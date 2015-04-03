;(function() {
  'use strict';

function cdMyDojos(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-my-dojos-template.html',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdMyDojos', cdMyDojos)
 
}());