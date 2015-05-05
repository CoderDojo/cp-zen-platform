;(function() {
  'use strict';

function cdFindVenue(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-four-find-venue',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdFindVenue', cdFindVenue)
 
}());