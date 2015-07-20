 'use strict';

function userEventsCtrl($scope, $stateParams, $translate, cdEventsService, alertService) {

  if($stateParams.userId){
    cdEventsService.getUserDojosEvents($stateParams.userId, function (response) {
      $scope.events = response;
      if(_.isEmpty($scope.events)) {
        //This user has no Events.
      }
    }, function (err) {
      alertService.showError( $translate.instant('Error loading Events') + ' ' + err);
    })
  }
}

angular.module('cpZenPlatform')
    .controller('user-events-controller', ['$scope', '$stateParams', '$translate', 'cdEventsService', 'alertService', userEventsCtrl]);
