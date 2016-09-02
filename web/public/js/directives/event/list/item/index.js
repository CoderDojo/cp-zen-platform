;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEventListItem', function () {
        return {
          scope: {
            'event': '='
          },
          restrict: 'AE',
          templateUrl: '/directives/tpl/event/list/item',
          controller: ['$scope', '$state', 'embedder', 'eventUtils', function($scope, $state, embedder, eventUtils) {
            var cdELI = this;
            cdELI.event = $scope.event;
            cdELI.isEmbedded = embedder.isEmbedded();
            cdELI.event.isPast = eventUtils.isEventInPast(_.last(cdELI.event.dates));
            cdELI.event = eventUtils.getFormattedDates(cdELI.event);
            if (!cdELI.event.isPast && cdELI.event.type === 'recurring') {
              cdELI.event.nextDate = void 0;
              var nextDateIndex = void 0;
              var eventIndex = 0;
              while (eventIndex < cdELI.event.dates.length && _.isUndefined(nextDateIndex)) {
                var date = cdELI.event.dates[eventIndex];
                if (!eventUtils.isEventInPast(date)) {
                  nextDateIndex = eventIndex;
                }
                eventIndex +=1;
              }
              if (nextDateIndex) {
                cdELI.event.upcomingDates = cdELI.event.formattedDates.slice(nextDateIndex);
                cdELI.event.nextDate = moment.utc(_.first(cdELI.event.upcomingDates).startTime).format('Do MMMM YY');
              }
            }
            cdELI.datesExpanded = false;
            cdELI.goTo = function() {
              embedder.redirectWrapper( function(){
                $state.go('dojo-event-details', {dojoId: cdELI.event.dojoId, eventId: cdELI.event.id});
              })
            }
          }],
          controllerAs: 'cdELI'
        };
    });

}());
