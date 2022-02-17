;(function() {
  'use strict';

function cdEventbriteOrganisations(){
  return {
    restrict: 'E',
    templateUrl: '/directives/tpl/eventbrite/organisations',
    link: function(scope, elem, attrs){
    }
  };
}

angular
  .module('cpZenPlatform')
  .directive('cdEventbriteOrganisations', [cdEventbriteOrganisations]);

}());