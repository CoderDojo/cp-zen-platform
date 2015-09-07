'use strict';

function cdApplyForEventCtrl($scope, $window, $state, $stateParams, $translate, $location, $modal, alertService, cdEventsService, cdUsersService, cdDojoService, usSpinnerService) {
  var dojoEvents = $scope.dojoRowIndexExpandedCurr;
  var eventIndex = $scope.tableRowIndexExpandedCurr;
  $scope.applyForSettings = {displayProp: 'name', buttonClasses: 'btn btn-primary btn-block'};
  $scope.event.selectedAccounts = {};
  $scope.isParent = false;
  $scope.ninjas = [];

  _.each($scope.event.sessions, function (session) {
    $scope.event.selectedAccounts[session.id] = [];
  });

  cdDojoService.getUsersDojos({userId: $scope.currentUser.id, dojoId: $scope.dojoId}, function (response) {
    if(_.contains(response[0].userTypes, 'parent-guardian')) $scope.isParent = true;
    if($scope.isParent) {
      cdUsersService.loadNinjasForUser($scope.currentUser.id, function (ninjas) {
        $scope.ninjas = ninjas;
      });
    } 
  }, function (err) { 
    console.error(err);
  });

  $scope.cancel = function () {
    if(dojoEvents){
      $scope.showEventInfo(dojoEvents, eventIndex);
    } else {
      $scope.showEventInfo(eventIndex, $scope.event.id);
    }
  }

  $scope.showSessionDetails = function (session) {
    var sessionModalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: '/dojos/template/events/session-details',
      controller: 'session-modal-controller',
      size: 'lg',
      resolve: {
        session: function () {
          return session;
        },
        event: function () {
          return $scope.event;
        },
        ninjas: function () {
          return $scope.ninjas;
        }
      }
    });

    sessionModalInstance.result.then(function (result) {
      if(result.ok === false) return alertService.showError($translate.instant(result.why));
      alertService.showAlert($translate.instant('Thank You. Your application has been received. You will be notified by email if you are approved for this event.'));
    }, null);
  };

  $scope.goToGoogleMaps = function (position) {
    $window.open('http://maps.google.com/maps?z=12&t=m&q=loc:' + position.lat + '+' + position.lng);
  };

}

angular.module('cpZenPlatform')
    .controller('apply-for-event-controller', ['$scope', '$window', '$state', '$stateParams', '$translate', '$location', '$modal', 'alertService','cdEventsService', 'cdUsersService', 'cdDojoService', 'usSpinnerService', cdApplyForEventCtrl]);
