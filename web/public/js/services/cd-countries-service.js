'use strict';

function cdCountriesService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      list: function(win, fail){
        cdApi.get('countries', win, fail || topfail);
      },
      loadChildren: function(geonameId, win, fail) {
        cdApi.get('countries/' + geonameId, win, fail || topfail);
      },
      loadLatLongData: function(win, fail) {
        cdApi.get('countries_lat_long', win, fail || topfail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdCountriesService', ['cdApi', cdCountriesService])
;