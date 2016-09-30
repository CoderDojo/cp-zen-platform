;(function() {
  'use strict';

function cdDojoFormStatus(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/dojo-form/status',
      link: function(scope, elem, attrs){
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojoFormStatus', [cdDojoFormStatus]);

}());
