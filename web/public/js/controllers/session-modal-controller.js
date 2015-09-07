(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $modalInstance, $translate, cdEventsService, session, event, ninjas) {
    $scope.session = session;  
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.ninjas = ninjas;

    $scope.sessionApplication = {
      eventId: $scope.event.id,
      sessionId: session.id,
      tickets: [],
      emailSubject: $translate.instant('Event application received')
    };
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.updateTickets = function (quantity, ticket) {
      $scope.sessionApplication.tickets.push({name: ticket.name, quantity: quantity});
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
    .controller('session-modal-controller', ['$scope', '$modalInstance', '$translate', 'cdEventsService', 'session', 'event', 'ninjas', cdSessionModalCtrl]);

})();