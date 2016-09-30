;(function() {
  'use strict';

function cdDojoFormActivity(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-form/activity',
      link: function(scope, elem, attrs){
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoFormActivity', [cdDojoFormActivity]);

}());
