;(function() {
  'use strict';

var subStrings = ["http://","https://"];

function httpPrefix() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, controller) {
      function ensureHttpPrefix(value) {
        if(value && !/^(https?):\/\//i.test(value) && containsAny(value, subStrings)) {
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

function containsAny(str, substrings) {
  for (var i=0; i < substrings.length; i++) {
    var substring = substrings[i];
    if (substring.indexOf(str) !== -1) {
      return false;
    }
  }
  return true; 
}

angular
    .module('cpZenPlatform')
    .directive('httpPrefix', httpPrefix)
 
}());