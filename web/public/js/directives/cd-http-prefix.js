;(function() {
  'use strict';

function httpPrefix() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, controller) {
      function ensureHttpPrefix(value) {
        if(value && !/^(http):\/\//i.test(value) && 'http://'.indexOf(value) === -1) {
          controller.$setViewValue('http://' + value);
          controller.$render();
          return 'http://' + value;
        } else {
          return value;
        }
      }
      controller.$formatters.push(ensureHttpPrefix);
      controller.$parsers.push(ensureHttpPrefix);
    }
  };
}

angular
    .module('cpZenPlatform')
    .directive('httpPrefix', httpPrefix)
 
}());