'use strict';

function charterCtrl($scope, $http, $stateParams, cdAgreementsService, currentUser, $window){
  $scope.acceptCharterAgreement = function (agreement) {

    var agreementObj = {};
    agreementObj.fullName = agreement.agreedToBy;
    agreementObj.userId = currentUser.data.id;
    agreementObj.agreementVersion = 2; //This is hardcoded for now; we don't have a way of changing the charter just yet.


    cdAgreementsService.save(agreementObj, function (response) {
      $window.location.href = $stateParams.referer || '/dashboard/profile/' + currentUser.data.id + '/edit';
    });

  }
}

angular.module('cpZenPlatform')
  .controller('charter-controller', ['$scope', '$http', '$stateParams', 'cdAgreementsService', 'currentUser', '$window',charterCtrl]);