// Font awesome rounded icon directive
// To use call `div cd-rounded-icon src="icon-name"></div>` you just need the name of the icon without the fa
;(function() {
  'use strict';

function cdRoundedIcon(){
    return {
      scope: {
        src: '@?',
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-rounded-icon',
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdRoundedIcon', [cdRoundedIcon]);
}());
