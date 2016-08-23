;(function() {
  'use strict';

function cdViewProfileSidebar($compile, cdPollService, $interval){
    return {
      scope: false,
      restrict: 'E',
      templateUrl: '/directives/tpl/user/cd-profile/view/sidebar',
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdViewProfileSidebar', [cdViewProfileSidebar]);

}());
