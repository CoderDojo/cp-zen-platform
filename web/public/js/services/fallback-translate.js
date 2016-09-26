'use strict';

angular.module('cpZenPlatform').factory('fallbackTranslate', ['$translate', function($translate) {
  var originalTranslateInstant = $translate.instant;

  $translate.instant = function (key) {
    var translation = originalTranslateInstant.apply($translate, arguments);
    return translation || key;
  };
}]);
