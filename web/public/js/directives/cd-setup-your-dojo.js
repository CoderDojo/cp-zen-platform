;(function() {
  'use strict';

function cdSetupYourDojo(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-three-setup-your-dojo',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdSetupYourDojo', cdSetupYourDojo)
 
}());