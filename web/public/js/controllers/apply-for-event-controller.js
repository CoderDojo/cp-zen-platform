(function () {
  'use strict';

  function cdApplyForEventCtrl($scope, $window, $state, $stateParams, $translate, $location, $modal,
    alertService, cdEventsService, cdUsersService, cdDojoService, usSpinnerService, dojoUtils) {
    var dojoEvents = $scope.dojoRowIndexExpandedCurr;
    var eventIndex = $scope.tableRowIndexExpandedCurr;
    var accountName;
    var accountTitle;

    var url = window.location.href;
    if((localStorage.joinDojo) && url.indexOf('event/')>=1){
      var initUserTypes = cdUsersService.getInitUserTypes( function (userTypes) {
        var userType = _.find(userTypes, JSON.parse($scope.currentUser.initUserType));
        var userObject = {
          userType : userType,
          validate: 'false'
        };

        dojoUtils.requestToJoin(userObject, $scope.event.dojoId);
        delete localStorage.joinDojo;
      });
    }


    $scope.cancel = function () {
      if(dojoEvents){
        $scope.showEventInfo(dojoEvents, eventIndex);
      } else {
        $scope.showEventInfo(eventIndex, $scope.event.id);
      }
    }

    $scope.showSessionDetails = function (session) {
      if(!_.isEmpty($scope.currentUser)) {

        cdDojoService.dojosForUser($scope.currentUser.id, function (dojos) {
          var isMember = _.find(dojos, function (dojo) {
            return dojo.id === $scope.event.dojoId;
          });
          if(!isMember) return alertService.showAlert($translate.instant('Please click the Join Dojo button before applying for events.'));
          var sessionModalInstance = $modal.open({
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
            if($scope.event.ticketApproval) {
              alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
              $state.go('dojo-list');
            } else {
              alertService.showAlert($translate.instant('Thank You. You will receive an email containing your booking confirmation.'));
              $state.go('dojo-list');
            }
          }, null);
        });
      } else {
        localStorage.setItem('eventId', session.eventId);
        $state.go('register-account', { referer: $location.url() });
      }
    };

    $scope.goToGoogleMaps = function (position) {
      $window.open('https://maps.google.com/maps?z=12&t=m&q=loc:' + position.lat + '+' + position.lng);
    };
  }

  angular.module('cpZenPlatform')
      .controller('apply-for-event-controller', ['$scope', '$window', '$state', '$stateParams', '$translate', '$location', '$modal', 'alertService',
      'cdEventsService', 'cdUsersService', 'cdDojoService', 'usSpinnerService', 'dojoUtils', cdApplyForEventCtrl]);
})();
