'use strict';

function charterCtrl($scope, $http, $stateParams, cdAgreementsService, currentUser, $window){
  $scope.acceptCharterAgreement = function (agreement) {

    var agreementObj = {};
    agreementObj.fullName = agreement.agreedToBy;
    agreementObj.userId = currentUser.data.id;
    agreementObj.agreementVersion = 2; //This is hardcoded for now; we don't have a way of changing the charter just yet.

    $http.get('http://ipinfo.io/json').
      success(function (data) {
        agreementObj.ipAddress = data.ip;

        cdAgreementsService.save(agreementObj, function (response) {
          $window.location.href = $stateParams.referer || '/dashboard/dojo-list';
        });
      });
  }
}

angular.module('cpZenPlatform')
  .controller('charter-controller', ['$scope', '$http', '$stateParams', 'cdAgreementsService', 'currentUser', '$window',charterCtrl]);