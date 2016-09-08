;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPollSetup = {
  restrict: 'E',
  bindings: {
    poll: '=',
    count: '='
  },
  templateUrl: '/directives/tpl/cdf/polls/setup',
  controller: ['cdPollService', function (cdPollService) {
    var cdfPS = this;
  }],
  controllerAs: 'cdfPS'
};

angular
    .module('cpZenPlatform')
    .component('cdfPollSetup', cdfPollSetup);
}());
