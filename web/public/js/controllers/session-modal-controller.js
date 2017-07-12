(function() {
  'use strict';

  function cdSessionModalCtrl($scope, $uibModalInstance, $translate, $state, cdEventsService,
   dojoId, session, event, applyForModel, usSpinnerService, currentUser, referer, cdDojoService) {
    $scope.dojoId = dojoId;
    $scope.session = angular.copy(session);
    $scope.sessionQuantities = _.range(2);
    $scope.maxQuantities = _.range(11);
    $scope.event = event;
    $scope.applyForModel = applyForModel;
    $scope.currentUser = currentUser;
    $scope.referer = referer;
    $scope.notes = $translate.instant('N/A');

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
    $scope.selectSettings = {};

    _.each(_.keys($scope.applyForModel), function (ticketId) {
      $scope.sessionApplication.tickets[ticketId] = [];
    });

    cdDojoService.getUsersDojos({userId: $scope.currentUser.id, dojoId: $scope.dojoId}, function(userDojos){
      var userDojo = userDojos[0];
      $scope.canOverBook = _.find(userDojo.userPermissions, {name: 'dojo-admin'}) || _.find(userDojo.userPermissions, {name: 'ticketing-admin'});
      _.each(_.keys($scope.session.tickets), function (ticketId) {
        var ticket = $scope.session.tickets[ticketId];
        $scope.session.tickets[ticketId].remaining = ticket.quantity - ticket.approvedApplications;

        var settings = _.clone($scope.applyForSettings);
        // Dojo admin can overbook an event
        if (!$scope.canOverBook) {
          settings.selectionLimit = ticket.remaining;
        }
        $scope.selectSettings[ticket.id] = settings;
      });
    })

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.updateTickets = function (quantity, ticket) {
      $scope.sessionApplication.tickets.other.push({name: ticket.name, quantity: quantity});
      $scope.sessionApplication.tickets.other = _.uniq($scope.sessionApplication.tickets.other, function (otherTicket) { return otherTicket.name });
    };

    $scope.checkTicketIsntFull = function(ticketId) {
      var ticket = $scope.session.tickets[ticketId];
      $scope.session.tickets[ticketId].remaining = ticket.quantity - ticket.totalApplications + $scope.sessionApplication.tickets[ticketId].length;
    }

    $scope.goToProfile = function () {
      $state.go('user-profile', {userId: currentUser.id});
      $uibModalInstance.dismiss();
    };

    $scope.getApplications = function (sessionApplication) {
      var applications = [];
      _.each(_.keys(sessionApplication.tickets), function (ticketId) {
        _.each(sessionApplication.tickets[ticketId], function (ticket) {
          var application = {
            dojoId: sessionApplication.dojoId,
            eventId: sessionApplication.eventId,
            sessionId: sessionApplication.sessionId,
            ticketName: ticket.ticketName,
            ticketType: ticket.ticketType,
            ticketId: ticket.ticketId,
            userId: ticket.userId,
            notes: $scope.notes
          };
          applications.push(application);
        });
      });
      return applications;
    };

    $scope.applyForEvent = function (sessionApplication) {
      usSpinnerService.spin('dojo-session-spinner');
      var applications = $scope.getApplications(sessionApplication);
      //set possible email subjects based on application status
      applications[0].emailSubject = {
        'received': 'Your ticket request for %1$s has been received',
        'approved': 'Your ticket for %1$s has been booked',
        'pending': 'Your ticket request for %1$s is pending approval'
      };
      applications[0].dojoEmailSubject = {
        'approved': 'A ticket has been booked for %1$s',
        'pending': 'A ticket request has been made for %1$s'
      };
      applications[0].parentEmailSubject = {
        'approved': 'A ticket has been booked for your child for %1$s',
        'pending': 'Your childs ticket request for %1$s is pending approval'
      };
      //bulkApplyApplications handles the creation of payloads for the email(s) and sends them
      cdEventsService.bulkApplyApplications(applications, function (response) {
        usSpinnerService.stop('dojo-session-spinner');
        $uibModalInstance.close(response);
      }, function (err) {
        usSpinnerService.stop('dojo-session-spinner');
        $uibModalInstance.close(err);
        console.error(err);
      });
    };
  }

  function applicationHasTickets(sessionApplication) {
    var ticketCount = 0;
    for( var i in sessionApplication.tickets ) {
      ticketCount += sessionApplication.tickets[i].length
    }
    return !!ticketCount;
  }

  angular.module('cpZenPlatform')
    .controller('session-modal-controller', ['$scope', '$uibModalInstance', '$translate', '$state', 'cdEventsService',
     'dojoId', 'session', 'event', 'applyForModel', 'usSpinnerService', 'currentUser', 'referer', 'cdDojoService', cdSessionModalCtrl]);

})();
