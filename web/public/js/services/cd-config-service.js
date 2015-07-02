'use strict';

function cdConfigService(cdApi, $q){
  function topfail(err){
    console.error(err);
  }

  return {
    get: function(key, win, fail){
      cdApi.get('config/get?key=' + key, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdConfigService', ['cdApi', '$q', cdConfigService]);
