;(function() {
  'use strict';

function cdApplyForEvent(){
  return {
    restrict: 'E',
    templateUrl: '/dojos/template/events/apply',
    controller:'apply-for-event-controller'
  }
}

angular
    .module('cpZenPlatform')
    .directive('cdApplyForEvent', cdApplyForEvent)
 
}());