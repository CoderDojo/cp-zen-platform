'use strict'

function cdPollService(cdApi, $q) {
  function topfail(err){
    console.log(err);
  }
  return {
    getSetup: function(pollId, win, fail) {
      return cdApi.get('poll/' + pollId, win, fail || topfail);
    },
    saveSetup: function (poll) {
      return cdApi.post('poll/save', {poll: poll});
    },
    list: function (query) {
      return cdApi.post('poll', {query: query});
    },
    save: function(poll, win, fail) {
      return cdApi.post('poll/results/save', {poll: poll}, win, fail || topfail);
    },
    remove: function(resultId, win, fail) {
      return cdApi.delete('poll/results/'+ resultId, win, fail || topfail);
    },
    count: function(pollId, win, fail) {
      return cdApi.get('poll/' + pollId + '/results/count', win, fail || topfail);
    },
    getPolledList: function(pollId, win, fail) {
      return cdApi.post('poll/' + pollId + '/results/count/expected', {dryRun: true}, win, fail || topfail);
    },
    getResults: function(query, win, fail) {
      return cdApi.post('poll/results', {query: query}, win, fail || topfail);
    },
    sendTestEmail: function(email, pollId, win, fail){
      return cdApi.post('poll/test', {email: email, pollId: pollId}, win, fail|| topfail);
    },
    sendEmail: function(dojoId, pollId, win, fail){
      return cdApi.post('poll/email', {query: {id: dojoId, limit$: 1}, pollId: pollId}, win, fail|| topfail);
    },
    startCampaign: function(pollId, win, fail){
      return cdApi.post('poll/start', {pollId: pollId}, win, fail|| topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdPollService', ['cdApi', '$q', cdPollService]);
