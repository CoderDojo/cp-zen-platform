'use strict';

function cdCountriesService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      list: function(win, fail){
        cdApi.get('countries', win, fail || topfail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdCountriesService', ['cdApi', cdCountriesService])
;