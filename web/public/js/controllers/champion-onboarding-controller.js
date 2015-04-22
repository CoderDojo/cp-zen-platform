 'use strict';

function cdChampionOnboardingCtrl($scope, auth, cdUsersService) {
  $scope.champion = {};

  auth.get_loggedin_user(function(user) {
    $scope.user = user;
  });

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.today = new Date();

  $scope.answers = ['Yes', 'No'];

  $scope.save = function(champion) {
    cdUsersService.promoteUser($scope.user.id, ['champion'], function(response) {
      console.log("response = " + JSON.stringify(response));
    });
  }
}

angular.module('cpZenPlatform')
    .controller('champion-onboarding-controller', ['$scope', 'auth', 'cdUsersService', cdChampionOnboardingCtrl]);