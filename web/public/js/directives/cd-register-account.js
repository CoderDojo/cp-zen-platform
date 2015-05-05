;(function() {
  'use strict';

function cdRegisterAccount(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-one-register',
      link: function (scope, element, attrs) { 
       
      }
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegisterAccount', cdRegisterAccount)
 
}());