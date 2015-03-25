'use strict';

angular.module('cpZenPlatform').factory('spinnerService', ['$loading', function($rootScope, $loading) {
  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;

  var defaultOptions = {
    active: false, // Defines current loading state
    text: 'Loading ...', // Display text
    className: '', // Custom class, added to directive
    overlay: true, // Display overlay
    spinner: true, // Display spinner
    spinnerOptions: {
      lines: 13, // The number of lines to draw
      length: 8, // The length of each line
      width: 3, // The line thickness
      radius: 12, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    }
  };

  $loading.setDefaultOptions(defaultOptions);

  var spinnerService = {};

  spinnerService.spin = function(keys) {
    keys = _.map(concat.apply([], slice.call(arguments, 0)), String);

    angular.forEach(keys, $loading.start);
  };

  spinnerService.stop = function(keys) {
    keys = _.map(concat.apply([], slice.call(arguments, 0)), String);

    angular.forEach(keys, $loading.finish);
  };

  return spinnerService;
}]);
