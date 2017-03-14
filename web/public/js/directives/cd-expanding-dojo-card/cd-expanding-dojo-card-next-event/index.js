;(function() {
  'use strict';
angular
    .module('cpZenPlatform')
    .component('cdExpandingDojoCardEvents', {
      bindings: {
        dojo: '<'
      },
      restrict: 'E',
      templateUrl: '/directives/tpl/cd-expanding-dojo-card/cd-expanding-dojo-card-next-event',
      controller: ['cdEventsService', 'eventUtils', function(cdEventsService, eventUtils){
        var ctrl = this;
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
        })
      }]
    });
}());
