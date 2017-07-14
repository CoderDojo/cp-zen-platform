;(function() {
  'use strict';
angular
  .module('cpZenPlatform')
  .directive('cdDojoName', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attr, ngModel) {
        var blacklist = ['coderdojo', 'dojo'];

        function setValidity (value) {
          var valid = _.every(blacklist, function (keyword) { return value.toLowerCase().indexOf(keyword) === -1; });
          ngModel.$setValidity('blacklist', valid);
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
