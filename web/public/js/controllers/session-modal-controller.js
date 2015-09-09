(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $modalInstance, $translate, cdEventsService, session, event, eventUserSelection) {
    $scope.session = session;  
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.eventUserSelection = eventUserSelection;

    $scope.applyForSettings = {displayProp: 'title', buttonClasses: 'btn btn-primary btn-block', showCheckAll: false, showUncheckAll: false, idProp: 'userId', externalIdProp: 'userId'};

    $scope.sessionApplication = {
      eventId: $scope.event.id,
      sessionId: session.id,
      tickets: {other:[]},
      emailSubject: $translate.instant('Event application received')
    };

    _.each($scope.session.tickets, function (ticket) {
      if(ticket.type !== 'other') $scope.sessionApplication.tickets[ticket.name] = [];
    });
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.updateTickets = function (quantity, ticket) {
      $scope.sessionApplication.tickets.other.push({name: ticket.name, quantity: quantity});
      $scope.sessionApplication.tickets.other = _.uniq($scope.sessionApplication.tickets.other, function (otherTicket) { return otherTicket.name });
    };

    $scope.applyForEvent = function (sessionApplication) {
      cdEventsService.applyForEvent(sessionApplication, function (response) {
        $modalInstance.close(response);
      }, function (err) {
        console.error(err);
      });
    };
  }

  angular.module('cpZenPlatform')
    .controller('session-modal-controller', ['$scope', '$modalInstance', '$translate', 'cdEventsService', 'session', 'event', 'eventUserSelection', cdSessionModalCtrl]);

})();