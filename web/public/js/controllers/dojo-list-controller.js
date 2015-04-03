'use strict';

function cdDojoListCtrl($scope, cdDojoService) {
    cdDojoService.list(function(response) {
      $scope.dojoData = response;
    });

  }

angular.module('cpZenPlatform')
    .controller('dojo-list-controller', ['$scope', 'cdDojoService', cdDojoListCtrl]);