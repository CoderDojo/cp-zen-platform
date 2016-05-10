'use strict'

function cdPollService(cdApi, $q) {
  function topfail(err){
    console.log(err);
  }
  return {
    save: function(poll, win, fail) {
      cdApi.post('poll/save', {poll: poll}, win, fail || topfail);
    },
    count: function(pollId, win, fail) {
      cdApi.get('poll/count/' + pollId, win, fail || topfail);
    },
    getSetup: function(pollId, win, fail) {
      cdApi.get('poll/' + pollId, win, fail || topfail);
    },
    getResults: function(query, win, fail) {
      cdApi.post('poll/results', {query: query}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdPollService', ['cdApi', '$q', cdPollService]);
