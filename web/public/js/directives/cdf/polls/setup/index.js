;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPollSetup = {
  restrict: 'E',
  bindings: {
    poll: '='
  },
  templateUrl: '/directives/tpl/cdf/polls/setup',
  controller: ['cdPollService', 'atomicNotifyService', '$translate', function (cdPollService, atomicNotifyService, $translate) {
    var cdfPS = this;

    cdfPS.sendEmail = function ( ) {
      cdPollService.sendTestEmail(cdfPS.testEmail, cdfPS.poll.id)
      .then( function () {
        atomicNotifyService.info($translate.instant('Your email has been sent successfuly'));
      })
      .catch( function (err) {
        atomicNotifyService.info($translate.instant('Something wrong happended when sending the email :') + err);
      });
    }

    cdfPS.startCampaign = function ( ) {
      cdPollService.startCampaign(cdfPS.poll.id)
      .then( function () {
        atomicNotifyService.info($translate.instant('Your poll started successfuly'));
      })
      .catch( function (err) {
        atomicNotifyService.info($translate.instant('Something wrong happended when starting your poll :') + err);
      });
    }

    cdfPS.save = function (poll) {
      if (poll.responses.length === 0){
        var toSave = _.clone(poll);
        toSave = _.pick(toSave, ['question', 'valueUnity', 'maxAnswers', 'endDate']);
        cdPollService.saveSetup(toSave)
        .then(function(savedPoll){
          poll = savedPoll.data;
        });
      }
    }


  }],
  controllerAs: 'cdfPS'
};

angular
    .module('cpZenPlatform')
    .component('cdfPollSetup', cdfPollSetup);
}());
