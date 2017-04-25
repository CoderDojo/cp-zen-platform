;(function() {
  'use strict';

/**
 * [cdImgFallback description]
 * For attempting to load an image, but reverting to a fallback if it doens't exist.
 * @return {[type]} [description]
 */
  function cdImgFallback () {
    return {
      scope: {
        originalSrc: '@',
        fallbackSrc: '@'
      },
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('error', function () {
          element.attr('src', scope.fallbackSrc);
        });
        element.attr('src', scope.originalSrc);
      }
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdImgFallback', [cdImgFallback]);
}());
