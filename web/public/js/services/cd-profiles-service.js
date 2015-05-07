'use strict';

function cdProfilesService(cdApi){
  function topfail(err){
    console.log(err);
  }

  return {
    getProfiles : function(id, win, fail){
      cdApi.get('profiles/' + id, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdProfilesService', ['cdApi', cdProfilesService]);