;(function() {
  'use strict';

function cdDojoEvents(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/events/list',
      scope: {
        dojoId: '@'
      },
      controller:'dojo-events-controller'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoEvents', cdDojoEvents)
 
}());