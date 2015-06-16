;(function() {
  'use strict';

function cdDojoEventsList(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/events/list',
      scope: {
        dojoId: '@'
      },
      controller:'dojo-events-list-controller'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoEventsList', cdDojoEventsList)
 
}());