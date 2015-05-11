'use strict';

function cdProfilesService(cdApi){
  function topfail(err){
    console.log(err);
  }

  return {
    getProfiles : function(query, win, fail){
      cdApi.post('profiles', {query: query}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdProfilesService', ['cdApi', cdProfilesService]);