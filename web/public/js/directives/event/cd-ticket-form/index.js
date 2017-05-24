;(function() {
  'use strict';

function cdTicketForm(){
    return {
      restrict: 'E',
      templateUrl: '/directives/tpl/event/cd-ticket-form',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdTicketForm', cdTicketForm)
}());
