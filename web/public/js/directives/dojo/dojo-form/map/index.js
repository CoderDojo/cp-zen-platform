;(function() {
  'use strict';

function cdDojoFormMap(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-form/map',
      link: function(scope, elem, attrs){

      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoFormMap', [cdDojoFormMap]);

}());
