'use strict';

function headerCtrl($window, $scope) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', headerCtrl]);
