;(function() {
  'use strict';

function cdGatherTeam(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-three-gather-team',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdGatherTeam', cdGatherTeam)
 
}());