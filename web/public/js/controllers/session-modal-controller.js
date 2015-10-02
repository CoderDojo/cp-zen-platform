(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $modalInstance, $translate, $state, cdEventsService, dojoId, session, event, applyForModel, usSpinnerService, currentUser, referer) {
    $scope.dojoId = dojoId;
    $scope.session = angular.copy(session);  
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.applyForModel = applyForModel;
    $scope.currentUser = currentUser;
    $scope.referer = referer;

    $scope.applyForSettings = {
      displayProp: 'title', 
      buttonClasses: 'btn btn-primary btn-block', 
      showCheckAll: false, 
      showUncheckAll: false,
      idProp: 'userId',
      externalIdProp: '',
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

    _.each(_.keys($scope.applyForModel), function (ticketId) {
      $scope.sessionApplication.tickets[ticketId] = [];
    });
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.updateTickets = function (quantity, ticket) {
      $scope.sessionApplication.tickets.other.push({name: ticket.name, quantity: quantity});
      $scope.sessionApplication.tickets.other = _.uniq($scope.sessionApplication.tickets.other, function (otherTicket) { return otherTicket.name });
    };

    $scope.goToProfile = function () {
      $state.go('user-profile', {userId: currentUser.id});
      $modalInstance.dismiss();
    };

    $scope.applyForEvent = function (sessionApplication) {
      usSpinnerService.spin('dojo-session-spinner');
      var applications = []
      _.each(_.keys(sessionApplication.tickets), function (ticketId) {
        _.each(sessionApplication.tickets[ticketId], function (ticket) {
          var application = {
            dojoId: sessionApplication.dojoId,
            eventId: sessionApplication.eventId,
            sessionId: sessionApplication.sessionId,
            ticketName: ticket.ticketName,
            ticketType: ticket.ticketType,
            ticketId: ticket.ticketId,
            userId: ticket.userId
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
    .controller('session-modal-controller', ['$scope', '$modalInstance', '$translate', '$state', 'cdEventsService', 'dojoId', 'session', 'event', 'applyForModel', 'usSpinnerService', 'currentUser', 'referer', cdSessionModalCtrl]);

})();