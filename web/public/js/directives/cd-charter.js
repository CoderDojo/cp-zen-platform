;(function() {
  'use strict';

function cdCharter(){
    return {
      restrict: 'E',
      templateUrl: '/charter/template/index'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdCharter', cdCharter)

}());
