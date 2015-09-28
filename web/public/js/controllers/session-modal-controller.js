(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $modalInstance, $translate, cdEventsService, dojoId, session, event, eventUserSelection, usSpinnerService) {
    $scope.dojoId = dojoId;
    $scope.session = session;  
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.eventUserSelection = eventUserSelection[$scope.event.dojoId];

    $scope.applyForSettings = {
      displayProp: 'title', 
      buttonClasses: 'btn btn-primary btn-block', 
      showCheckAll: false, 
      showUncheckAll: false,
      idProp: 'userId',
      externalIdProp: 'userId',
      enableSearch: true,
      scrollableHeight: '250px',
      scrollable: true
    };

    $scope.sessionApplication = {
      dojoId: $scope.dojoId,
      eventId: $scope.event.id,
      sessionId: session.id,
      tickets: {}
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
      usSpinnerService.spin('dojo-session-spinner');
      var applications = []
      _.each(_.keys(sessionApplication.tickets), function (ticket, index) {
        _.each(sessionApplication.tickets[ticket], function (userIds) {
          var ticketFound = _.find($scope.session.tickets, function (ticketObj) {
            return ticketObj.name  === ticket;
          });
          var application = {
            dojoId: sessionApplication.dojoId,
            eventId: sessionApplication.eventId,
            sessionId: sessionApplication.sessionId,
            ticketName: ticket,
            ticketType: ticketFound.type,
            userId: userIds.userId
          };
          applications.push(application);
        });
      });
      applications[0].emailSubject = {
        'request':  $translate.instant('Your ticket request for'),
        'received': $translate.instant('has been received'), 
        'approved': $translate.instant('has been approved') 
      };
      cdEventsService.bulkApplyApplications(applications, function (response) {
        usSpinnerService.stop('dojo-session-spinner');
        $modalInstance.close(response);
      }, function (err) {
        usSpinnerService.stop('dojo-session-spinner');
        $modalInstance.close(err);
        console.error(err);
      });
    };
  }

  angular.module('cpZenPlatform')
    .controller('session-modal-controller', ['$scope', '$modalInstance', '$translate', 'cdEventsService', 'dojoId', 'session', 'event', 'eventUserSelection', 'usSpinnerService', cdSessionModalCtrl]);

})();