;(function() {
  'use strict';
  /* global google */

  var ctrller = function ($scope, $uibModal, $timeout) {
    var ctrl = this;
    ctrl.$onInit = function () {
    };
  };
angular
    .module('cpZenPlatform')
    .component('cdDojoMapControls', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/map/controls',
      bindings : {
        open: '&'
      },
      //TODO : dep injection array
      controller: ctrller
    });

}());
