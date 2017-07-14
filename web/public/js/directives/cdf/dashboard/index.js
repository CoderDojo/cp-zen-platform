;(function() {
  'use strict';

var cdfDashboard = {
  restrict: 'E',
  bindings: {
  },
  templateUrl: '/directives/tpl/cdf/dashboard',
  controller: [function () {
    var cdfP = this;
  }],
  controllerAs: 'cdfD'
};

angular
    .module('cpZenPlatform')
    .component('cdfDashboard', cdfDashboard);
}());
