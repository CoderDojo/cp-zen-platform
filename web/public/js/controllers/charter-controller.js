'use strict';

function charterCtrl($scope, $state, $stateParams, cdAgreementsService, $translate, atomicNotifyService, alertService, auth){

  if($stateParams.showBannerMessage) {
    atomicNotifyService.info($translate.instant('Please sign the charter before continuing.'), 5000);
  }

  $scope.$on('$destroy', function(){
    atomicNotifyService.dismissAll();
  });
  if (_.isUndefined($scope.currentUser)) {
    auth.get_loggedin_user_promise().then(function (currentUser) {
      $scope.currentUser = currentUser;
    });
  }

  $scope.acceptCharterAgreement = function (agreement) {
    var agreementObj = {};
    agreementObj.fullName = agreement.agreedToBy;
    agreementObj.userId = $scope.currentUser.id;
    agreementObj.agreementVersion = 2; //This is hardcoded for now; we don't have a way of changing the charter just yet.

    cdAgreementsService.save(agreementObj, function (response) {
      if(response.msg){
        alertService.showError($translate.instant(response.msg));
      }
      $state.go('user-profile', {userId: $scope.currentUser.id});
    });
  }
}

angular.module('cpZenPlatform')
  .controller('charter-controller', ['$scope', '$state', '$stateParams', 'cdAgreementsService', '$translate', 'atomicNotifyService', 'alertService', 'auth', charterCtrl]);
