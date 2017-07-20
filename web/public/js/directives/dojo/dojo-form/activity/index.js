;(function() {
  'use strict';

function cdDojoFormActivity(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-form/activity',
      controller: ['$scope', 'dojoUtils', function($scope, dojoUtils){
        _.extend($scope, dojoUtils.getFrequencyStrings());
        $scope.startTime = moment($scope.dojo.startTime, 'HH:mm:SSZZ').toDate();
        $scope.endTime = moment($scope.dojo.endTime, 'HH:mm:SSZZ').toDate();
      }]
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoFormActivity', [cdDojoFormActivity]);
}());
