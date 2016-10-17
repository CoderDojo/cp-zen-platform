;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

var cdfPolls = {
  restrict: 'E',
  bindings: {

  },
  templateUrl: '/directives/tpl/cdf/polls',
  controller: ['cdPollService', '$q', '$translate', function (cdPollService, $q, $translate) {
    var cdfP = this;
    cdPollService.list({})
    .then(function (response) {
      cdfP.polls = response.data;
      return;
    })
    .then(function(){
      return $q.all((function () {
        var promises = [];
        _.each(cdfP.polls, function (poll, index) {
          var promise = cdPollService.getResults({pollId: poll.id})
          .then(function (response) {
            cdfP.polls[index].responses = response.data;
          })
          .then(function () {
            return cdPollService.count(poll.id)
            .then(function (response) {
              cdfP.polls[index].endDate = poll.endDate ? new Date(poll.endDate) : new Date();
              cdfP.polls[index].result = response.data.sum;
              cdfP.polls[index].count = response.data.count;
              cdfP.polls[index].formattedCount = (poll.count || 0) + ' ' + $translate.instant('participations')
            });
          })
          promises.push(promise);
        });
        return promises;
      })());
    });
    cdfP.new = function ( ) {
      cdfP.polls.push({
        question: "",
        maxAnswers: 1,
        responses: [],
        endDate: new Date()
      });
    }
  }],
  controllerAs: 'cdfP'
};

angular
    .module('cpZenPlatform')
    .component('cdfPolls', cdfPolls);
}());
