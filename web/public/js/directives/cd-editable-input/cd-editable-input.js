;(function() {
  'use strict';

function cdEditableInput(){
    return {
      restrict: 'A',
      templateUrl: '/directives/tpl/cd-editable-input/cd-editable-input',
      controller: function ($scope) {
        if(_.isUndefined($scope.editable)) $scope.editable = false;
        $scope.switchEdit = function(){
          $scope.editable = !$scope.editable;
        }
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdEditableInput', [cdEditableInput]);

}());
