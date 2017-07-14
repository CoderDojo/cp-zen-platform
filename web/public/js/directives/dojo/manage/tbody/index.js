'use strict';
(function () {
  angular
    .module('cpZenPlatform')
    // it has to be a directive to be able to use replace, which elsewhat breaks the DOM
    .directive('cdDojosManageTbody', function (){
      return {
        restrict: 'EA',
        scope: {
          dojos: '='
        },
        replace: true,
        bindToController: true,
        controllerAs: '$ctrl',
        // Required to bind
        controller: function ($scope) {
        },
        templateUrl: '/directives/tpl/dojo/manage/tbody'
      };
    });
}());
