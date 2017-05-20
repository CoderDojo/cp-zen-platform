;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .directive('cdEventListItem', function () {
        return {
          scope: {
            'event': '=',
            'private': '<',
            'canBook': '<'
          },
          restrict: 'AE',
          templateUrl: '/directives/tpl/event/list/item',
          controller: ['$scope', '$state', 'embedder', 'eventUtils', function ($scope, $state, embedder, eventUtils) {
            var cdELI = this;
            cdELI.event = $scope.event;
            cdELI.private = $scope.private;
            cdELI.isEmbedded = embedder.isEmbedded();
            cdELI.event.isPast = eventUtils.isEventInPast(_.last(cdELI.event.dates));
            var visibilityWatcher = $scope.$watch('canBook', function () {
              cdELI.canBook = $scope.canBook;
            });
            cdELI.event = eventUtils.getFormattedDates(cdELI.event);
            if (!cdELI.event.isPast && cdELI.event.type === 'recurring') {
              cdELI.event.upcomingDates = eventUtils.getNextDates(cdELI.event.dates, cdELI.event.formattedDates);
              cdELI.event.nextDate = _.first(cdELI.event.upcomingDates);
            }
            cdELI.datesExpanded = false;
            cdELI.goTo = function() {
              embedder.redirectWrapper( function(){
                $state.go('dojo-event-details', {dojoId: cdELI.event.dojoId, eventId: cdELI.event.id});
              })
            }
            $scope.$on('$destroy', function () {
              visibilityWatcher();
            });
          }],
          controllerAs: 'cdELI'
        };
    });

}());
