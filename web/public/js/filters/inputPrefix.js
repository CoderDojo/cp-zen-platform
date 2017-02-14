'use strict';
angular.module('cpZenPlatform')
.filter('inputPrefix', function () {
  return function (input, prevValue, prefixValue) {
    if (input.indexOf(prefixValue) === 0) {// We don't reapply the prefix
      return input;
    } else {
      if (prevValue && prevValue.indexOf(prefixValue) === 0) { // Avoid modiication of the prefix
        return prevValue;
      } else { // default behavior, append
        return prefixValue + input;
      }
    }
  };
});
