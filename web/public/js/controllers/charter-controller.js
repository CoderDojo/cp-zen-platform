 'use strict';

function cdCharterCtrl($scope, cdCharterService) {
    cdCharterService.load(function(response) {
      $scope.charterText = response;
    });
  }

angular.module('cpZenPlatform')
    .controller('charter-controller', ['$scope', 'cdCharterService', cdCharterCtrl]);