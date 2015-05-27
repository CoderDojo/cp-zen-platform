'use strict';

function cdUserProfileCtrl($scope, $state, cdUsersService, cdDojoService, alertService, $translate) {
  var userId = $state.params.userId;

  cdUsersService.load(userId, function (response) {
    $scope.user = response;
  }, function (err) {
    alertService.showError($translate.instant('Error loading profile') + ' ' + err);
  });

  cdDojoService.dojosForUser(userId, function (response) {
    $scope.dojos = response;
  }, function (err) {
    alertService.showError( $translate.instant('Error loading Dojos') + ' ' + err);
  });
}

angular.module('cpZenPlatform')
    .controller('user-profile-controller', ['$scope', '$state', 'cdUsersService', 'cdDojoService', 'alertService', '$translate' , cdUserProfileCtrl]);