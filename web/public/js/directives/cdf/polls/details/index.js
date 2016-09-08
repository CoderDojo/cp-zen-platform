;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPollDetails = {
  restrict: 'E',
  bindings: {
  },
  templateUrl: '/directives/tpl/cdf/polls/details',
  controller: ['cdPollService','$stateParams', '$translate', function (cdPollService, $stateParams, $translate) {
    var cdfPD = this;
    cdfPD.pollId = $stateParams.pollId;
    cdPollService.getSetup(cdfPD.pollId)
    .then(function (response) {
      cdfPD.poll = response.data[0];
      return;
    })
    .then(function(){
      cdPollService.getResults({pollId: cdfPD.poll.id})
      .then(function(response){
        cdfPD.poll.responses = response.data;
      })
      .then(cdfPD.getFormattedCount)
    });

    cdfPD.getCount = function (){
      return cdPollService.count(cdfPD.pollId)
      .then(function(response){
        cdfPD.poll.count = response.data.count;
        cdfPD.poll.formattedCount = (cdfPD.poll.count || 0) + ' ' + $translate.instant('participations')
      });
    }
  }],
  controllerAs: 'cdfPD'
};

angular
    .module('cpZenPlatform')
    .component('cdfPollDetails', cdfPollDetails);
}());
