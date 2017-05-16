'use strict';

function cdAgreementsService(cdApi, $q){
  function topfail(err){
    console.log(err);
  }
  var base = 'agreements';
  return {
    save: function (agreement) {
      agreement = angular.copy(agreement);
      return cdApi.post(base, { agreement: agreement });
    },
    count: function(query, win, fail) {
      cdApi.post(base + '/count', {query: query}, win, fail || topfail);
    },
    loadUserAgreement: function (version, userId) {
      return cdApi.get(base + '/version/' + version + '/users/' + userId);
    },
    loadUserAgreementPromise: function (id) {
      var deferred = $q.defer();

      cdApi.get(base + '/' + id, deferred.resolve, deferred.reject);

      return deferred.promise;
    },
    getCurrentCharterVersion: function () {
      return cdApi.get(base + '/version');
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdAgreementsService', ['cdApi', '$q', cdAgreementsService]);
