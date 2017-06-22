(function () {
  'use strict';

  function cdApplyForEventCtrl($scope, $window, $state, $stateParams, $translate, $location, $uibModal,
    alertService, cdEventsService, cdUsersService, cdDojoService, usSpinnerService, dojoUtils, eventUtils) {
    var dojoEvents = $scope.dojoRowIndexExpandedCurr;
    var eventIndex = $scope.tableRowIndexExpandedCurr;
    var accountName;
    var accountTitle;
    $scope.isMember = false;
    $scope.event.isPast = eventUtils.isEventInPast(_.last($scope.event.dates));

    var url = window.location.href;
    if(($stateParams.joinDojo) && url.indexOf('event/')>=1){
      var initUserTypes = cdUsersService.getInitUserTypes( function (userTypes) {
        var userType = _.find(userTypes, JSON.parse($scope.currentUser.initUserType));
        var userObject = {
          userType : userType,
          validate: 'false'
        };

        dojoUtils.requestToJoin(userObject, $scope.event.dojoId);
      });
    }

    if (!_.isEmpty($scope.currentUser)) {
      cdDojoService.dojosForUser($scope.currentUser.id, function (dojos) {
        $scope.isMember = _.find(dojos, function (dojo) {
          return dojo.id === $scope.event.dojoId;
        });
      });
    }

    $scope.cancel = function () {
      if (dojoEvents) {
        $scope.showEventInfo(dojoEvents, eventIndex);
      } else {
        $scope.showEventInfo(eventIndex, $scope.event.id);
      }
    };

    $scope.canBook = function () {
      return eventUtils.canBook($scope.event.public, $scope.dojo.private, $scope.isMember);
    };

    $scope.showSessionDetails = function (session) {
      if (!_.isEmpty($scope.currentUser)) {
        if(!$scope.isMember) return alertService.showAlert($translate.instant('Please click the Join Dojo button before applying for events.'));
        var sessionModalInstance = $uibModal.open({
          templateUrl: '/dojos/template/events/session-details',
          controller: 'session-modal-controller',
          size: 'lg',
          resolve: {
            dojoId: function () {
              return $scope.dojoId;
            },
            session: function () {
              return session;
            },
            event: function () {
              return $scope.event;
            },
            applyForModel: function () {
              $scope.applyForModel = {};
              _.each(session.tickets, function (ticket) {
                var applyForData = angular.copy($scope.eventUserSelection[$scope.event.dojoId]);
                _.each(applyForData, function (applyObj) {
                  applyObj.ticketId = ticket.id;
                  applyObj.ticketName = ticket.name;
                  applyObj.ticketType = ticket.type;
                });
                $scope.applyForModel[ticket.id] = applyForData;
              });
              return $scope.applyForModel;
            },
            currentUser: function () {
              return $scope.currentUser;
            },
            referer: function () {
              return 'dojo-event-list';
            }
          }
        });

        sessionModalInstance.result.then(function (result) {
          if(result.ok === false) return alertService.showError($translate.instant(result.why));
          //If event requires ticket approval
          if($scope.event.ticketApproval) {
            alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
            $state.go('dojo-list');
          } else {
            alertService.showAlert($translate.instant('Thank You. You will receive an email containing your booking confirmation.'));
            $state.go('dojo-list');
          }
        }, null);
      } else {
        $state.go('register-account.require', { referer: $location.url(), eventId: session.eventId });
      }
    };
  }

  angular.module('cpZenPlatform')
      .controller('apply-for-event-controller', ['$scope', '$window', '$state', '$stateParams', '$translate', '$location', '$uibModal', 'alertService',
      'cdEventsService', 'cdUsersService', 'cdDojoService', 'usSpinnerService', 'dojoUtils', 'eventUtils', cdApplyForEventCtrl]);
})();
