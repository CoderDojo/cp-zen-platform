;(function() {
  'use strict';

function cdChampionRegistration(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-two-champion-registration',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdChampionRegistration', cdChampionRegistration)
 
}());