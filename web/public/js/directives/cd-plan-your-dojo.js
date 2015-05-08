;(function() {
  'use strict';

function cdPlanYourDojo(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-five-plan-your-dojo',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdPlanYourDojo', cdPlanYourDojo)
 
}());