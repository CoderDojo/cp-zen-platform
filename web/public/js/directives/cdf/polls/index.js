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
      return $q.all((function(){
        var promises = [];
        _.each(cdfP.polls, function(poll, index){
          var promise = cdPollService.getResults({pollId: poll.id})
          .then(function(response){
            cdfP.polls[index].responses = response.data;
          })
          .then(function(){
            return cdPollService.count(poll.id)
            .then(function(response){
              poll.count = response.data.count;
              poll.formattedCount = (poll.count || 0) + ' ' + $translate.instant('participations')
            });
          })
          promises.push(promise);
        });
        return promises;
      })());
    });
    cdfP.new = function ( ) {
      cdfP.polls.push({
        question: "How many fucks do you give?",
        maxAnswers: 1,
        responses: []
      });
    }
    cdfP.save = function (poll) {
      if (poll.responses.length === 0){
        var toSave = _.clone(poll);
        delete toSave.responses;
        delete toSave.$$hashKey;
        cdPollService.saveSetup(toSave)
        .then(function(savedPoll){
          poll = savedPoll.data;
        });
      }
    }
  }],
  controllerAs: 'cdfP'
};

angular
    .module('cpZenPlatform')
    .component('cdfPolls', cdfPolls);
}());
