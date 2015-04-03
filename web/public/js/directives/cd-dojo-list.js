;(function() {
  'use strict';

function cdDojoList(){
    return {
      restrict: 'E',
      templateUrl: '/content/dojos/cd-dojo-list-template.html',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

  angular
    .module('cpZenPlatform')
    .directive('cdDojoList', cdDojoList)
 
}());