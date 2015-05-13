;(function() {
  'use strict';

function cdDojoListing(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-four-dojo-listing',
      link: function (scope, element, attrs) { 
        
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoListing', cdDojoListing)
 
}());