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
      return cdApi.get('poll/count/' + pollId, win, fail || topfail);
    },
    getResults: function(query, win, fail) {
      return cdApi.post('poll/results', {query: query}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdPollService', ['cdApi', '$q', cdPollService]);
