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
