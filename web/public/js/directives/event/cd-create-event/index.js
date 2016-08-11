;(function() {
  'use strict';

function cdCreateEvent(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/event/cd-create-event',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdCreateEvent', cdCreateEvent)
}());
