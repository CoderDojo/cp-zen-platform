;(function() {
  'use strict';

function cdRegisterAccountProfile(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-one-register-profile',
      link: function (scope, element, attrs) {
      },
      controller: 'login',
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegisterAccountProfile', cdRegisterAccountProfile)
}());
