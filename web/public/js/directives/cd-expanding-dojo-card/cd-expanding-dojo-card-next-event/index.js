;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCardEvents', {
      bindings: {
        dojo: '<',
        isTicketingAdmin: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card/cd-expanding-dojo-card-next-event',
      controller: ['cdEventsService', 'eventUtils', '$translate', function(cdEventsService, eventUtils, $translate){
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.createButtonLabel = ctrl.dojo.verified ? $translate.instant('Create Event') : $translate.instant('Create your first event');
          cdEventsService.search({
            "dojoId": ctrl.dojo.id,
            "status": "published",
            "filterPastEvents": true,
            "sort$": {
              "createdAt":-1
            },
            // "limit$": 1     //Limit doesn't work with filterPastEvents
          }).then(function(events){
            events.sort(eventUtils.nextDateComparator);
            ctrl.event = events[0];
          });
        }
        ctrl.canBook = function () {
          return eventUtils.canBook(ctrl.event.public, ctrl.dojo.private, true, ctrl.dojo.verified);
        }
      }]
    });
}());
