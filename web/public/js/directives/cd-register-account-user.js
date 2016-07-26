;(function() {
  'use strict';

function cdRegisterAccountUser(){
    return {
      restrict: 'E',
      templateUrl: '/dojos/template/start-dojo-wizard/step-one-register-user',
      link: function (scope, element, attrs) {
      },
      controller: function ($scope) {
        this.formData = {};
        this.formData.user = {};
        console.log($scope);
      },
      controllerAs : 'user'
    }
  }

angular
    .module('cpZenPlatform')
    .directive('cdRegisterAccountUser', cdRegisterAccountUser)
}());
