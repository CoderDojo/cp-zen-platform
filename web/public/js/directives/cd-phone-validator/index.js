;(function() {
  'use strict';
angular
  .module('cpZenPlatform')
  .directive('cdPhoneValidator', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attr, ngModel) {
        function setValidity (value) {
          // We don't have access to the value, it's only committed once it's valid (lib behavior)
          var valid = ((ngModel.$viewValue && ngModel.$viewValue.trim().length > 4) ||
            (value !== undefined && value.length > 4));
          ngModel.$setValidity('not-phone-prefix', valid);
          return valid || undefined;
        }
        ngModel.$parsers.unshift(function (value) {
          return setValidity(value) ? value : undefined;
        });

        ngModel.$formatters.unshift(function (value) {
          setValidity(value);
          return value;
        });
      }
    };
  });
}());
