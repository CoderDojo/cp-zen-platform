'use strict';

function cdAgreementsService(cdApi, $q){
  function topfail(err){
    console.log(err);
  }

  return {
    save: function(agreement, win, fail){
      agreement = angular.copy(agreement);
      cdApi.post('agreements', { agreement: agreement }, win, fail || topfail);
    },
    getAgreementsByIds: function(ids, win, fail){
      cdApi.post('agreements/list-by-ids', {usersIds: ids}, win, fail || topfail);
    },
    count: function(query, win, fail){
      cdApi.post('agreements/count', {query: query}, win, fail || topfail);
    },
    loadUserAgreement: function(id, win, fail){
      cdApi.get('agreements/' + id, win, fail || topfail);
    },
    loadUserAgreementPromise: function(id){
      var deferred = $q.defer();

      cdApi.get('agreements/' + id, deferred.resolve, deferred.reject);

      return deferred.promise;
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdAgreementsService', ['cdApi', '$q', cdAgreementsService]);
