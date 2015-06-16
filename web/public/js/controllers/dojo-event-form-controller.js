(function() {
  'use strict';

  function dojoEventFormCtrl($scope, $stateParams, $location) {
    var dojo = {
      id: $stateParams.dojoId
    };

    if ($stateParams.eventId) {
      console.log('load event details');
    }
  }

  angular.module('cpZenPlatform')
    .controller('dojo-event-form-controller', ['$scope', '$stateParams', '$location', dojoEventFormCtrl]);

})();

