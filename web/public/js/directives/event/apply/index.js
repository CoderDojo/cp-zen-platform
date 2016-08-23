;(function() {
  'use strict';

function cdApplyForEvent(){
  return {
    restrict: 'E',
    templateUrl: '/directives/tpl/event/apply',
    controller:'apply-for-event-controller'
  }
}

angular
    .module('cpZenPlatform')
    .directive('cdApplyForEvent', cdApplyForEvent)

}());
