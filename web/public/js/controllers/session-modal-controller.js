(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $modalInstance, $translate, cdEventsService, session, event, eventUserSelection) {
    $scope.session = session;  
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.eventUserSelection = eventUserSelection[$scope.event.dojoId];

    $scope.applyForSettings = {displayProp: 'title', buttonClasses: 'btn btn-primary btn-block', showCheckAll: false, showUncheckAll: false, idProp: 'userId', externalIdProp: 'userId'};

    $scope.sessionApplication = {
      eventId: $scope.event.id,
      sessionId: session.id,
      tickets: {},
      emailSubject: $translate.instant('Event application received')
    };
    
    _.each($scope.session.tickets, function (ticket) {
      $scope.sessionApplication.tickets[ticket.name] = [];
    });
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.updateTickets = function (quantity, ticket) {
      $scope.sessionApplication.tickets.other.push({name: ticket.name, quantity: quantity});
      $scope.sessionApplication.tickets.other = _.uniq($scope.sessionApplication.tickets.other, function (otherTicket) { return otherTicket.name });
    };

    $scope.applyForEvent = function (sessionApplication) {
      var applications = []
      _.each(_.keys(sessionApplication.tickets), function (ticket) {
        _.each(sessionApplication.tickets[ticket], function (userIds) {
          var ticketFound = _.find($scope.session.tickets, function (ticketObj) {
            return ticketObj.name  === ticket;
          });
          var application = {
            sessionId: sessionApplication.sessionId,
            ticketName: ticket,
            ticketType: ticketFound.type,
            userId: userIds.userId
          };
          applications.push(application);
        });
      });
      cdEventsService.bulkApplyApplications(applications, function (response) {
        $modalInstance.close(response);
      }, function (err) {
        $modalInstance.close(err);
        console.error(err);
      });
    };
  }

  angular.module('cpZenPlatform')
    .controller('session-modal-controller', ['$scope', '$modalInstance', '$translate', 'cdEventsService', 'session', 'event', 'eventUserSelection', cdSessionModalCtrl]);

})();