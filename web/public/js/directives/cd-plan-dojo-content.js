;(function() {
  'use strict';

function cdPlanDojoContent(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-five-plan-dojo-content',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdPlanDojoContent', cdPlanDojoContent)
 
}());