;(function() {
  'use strict';

function cdDojoFormContact(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-form/contact',
      link: function(scope, elem, attrs){
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoFormContact', [cdDojoFormContact]);

}());
