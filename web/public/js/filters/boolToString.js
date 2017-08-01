'use strict';
angular.module('cpZenPlatform')
.filter('boolToString', function () {
  return function (bool) {
    return bool ? 'Yes' : 'No';
  };
});
