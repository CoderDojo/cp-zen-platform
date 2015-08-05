'use strict';

function charterCtrl($scope, $http, $state, $stateParams, cdAgreementsService, currentUser, $window, $translate, atomicNotifyService){
  
  if($stateParams.showBannerMessage) {
    atomicNotifyService.info($translate.instant('Please sign the charter before continuing.'), 5000);
  }

  $scope.$on('$destroy', function(){
    atomicNotifyService.dismissAll();
  });

  $scope.acceptCharterAgreement = function (agreement) {
    var agreementObj = {};
    agreementObj.fullName = agreement.agreedToBy;
    agreementObj.userId = currentUser.data.id;
    agreementObj.agreementVersion = 2; //This is hardcoded for now; we don't have a way of changing the charter just yet.

    cdAgreementsService.save(agreementObj, function (response) {
      $state.go('user-profile', {userId: currentUser.data.id});
    });
  }
}

angular.module('cpZenPlatform')
  .controller('charter-controller', ['$scope', '$http', '$state', '$stateParams', 'cdAgreementsService', 'currentUser', '$window', '$translate', 'atomicNotifyService', charterCtrl]);