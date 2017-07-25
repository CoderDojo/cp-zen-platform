;(function() {
  'use strict';

function focusInvalid () {
  return {
    restrict: 'A',
    require: '^form',
    link: function (scope, element, attrs, controller) {
      // We store a ref to controller so we can watch it
      scope.ctrl = controller;
      var invalidElement = void 0;
      var elementValidityWatcher = void 0;
      var formValidityList = element[0];

      var validityWatcher = scope.$watch('ctrl.$error.required', function () {
        // Before the user starts inputting anything
        if (controller.$pristine) {
          // This can change depending on async load, so it shoudln't stop watching
          if (controller.$error && controller.$error.required && controller.$error.required.length > 0) {
            // Joke's on you if you call your field "false"
            var names = _.filter(_.map(controller.$error.required, '$name'), Boolean);
            invalidElement = _.find(formValidityList, function (el) { return names.indexOf(el.name) > -1; });
            if (invalidElement) {
              // Add a watcher to be able to switch focused elem until we find the proper one or it's blurred
              elementValidityWatcher = scope.$watch('ctrl["' + invalidElement.name + '"].$valid', checkElementValidity);
              var el = $(invalidElement);
              el.focus();
              // If the user took controle, stop
              el.on('blur.focusInvalid', function () {
                clearWatchers();
              });
            }
          }
        } else {
          // Suicide, avoid jumping around, the user took control
          clearWatchers();
        }
      }, true);

      // Generic removal of any watcher set by this function
      var clearWatchers = function () {
        if (invalidElement) $(invalidElement).off('blur.focusInvalid');
        if (validityWatcher) validityWatcher();
        if (elementValidityWatcher) elementValidityWatcher();
      };
      // Continue or die condition when an element is found
      function checkElementValidity (prevV, newV, prev2, new2) {
        if (invalidElement && invalidElement.name && controller[invalidElement.name].$valid) {
          invalidElement = void 0;
          if (elementValidityWatcher) elementValidityWatcher();
        }
      }

      scope.$on('destroy', function () {
        clearWatchers();
      });
    }
  };
}

angular
    .module('cpZenPlatform')
    .directive('focusInvalid', [focusInvalid]);

}());
