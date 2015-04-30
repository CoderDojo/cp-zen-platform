;(function() {
  'use strict';

function cdDojoPreparation(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-three-dojo-preparation',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoPreparation', cdDojoPreparation)
 
}());