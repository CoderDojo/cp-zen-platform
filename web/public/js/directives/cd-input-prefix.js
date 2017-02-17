'use strict';
angular.module('cpZenPlatform')
.directive('cdInputPrefix', ['$filter', function ($filter) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function ensurePrefix (value, oldvalue) {
        if (value && value.length > 0) {
          var prevValue = controller.$modelValue;
          // Need to add prefix if we don't have http:// prefix already AND we don't have part of it
          value = $filter('inputPrefix')(value, prevValue, attrs.cdInputPrefix);
          controller.$setValidity('parse', true);
          controller.$setViewValue(value);
          controller.$render();
        }
        return value;
      }
      // controller.$formatters.push(ensurePrefix);
      controller.$parsers.splice(0, 0, ensurePrefix);
    }
  };
}]);
