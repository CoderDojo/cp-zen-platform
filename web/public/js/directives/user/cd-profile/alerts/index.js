;(function() {
  'use strict';

function cdUserProfileAlerts(){
    return {
      restrict: 'EA',
      templateUrl: '/directives/tpl/user/cd-profile/alerts',
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdUserProfileAlerts', [cdUserProfileAlerts]);

}());
