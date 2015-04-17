'use strict';

function cdCountriesService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      listCountries: function(win, fail){
        cdApi.get('geo/countries', win, fail || topfail);
      },
      listPlaces: function(countryCode, search, win, fail) {
        cdApi.get('geo/places/' + countryCode + '?search=' + search, win, fail || topfail);
      },
      loadContinentsLatLongData: function(win, fail) {
        cdApi.get('geo/continents_lat_long', win, fail || topfail);
      },
      loadCountriesLatLongData: function(win, fail) {
        cdApi.get('geo/countries_lat_long', win, fail || topfail);
      },
      loadCountriesContinents: function(win, fail) {
        cdApi.get('countries_continents', win, fail || topfail);
      },
      countyFromCoordinates: function(coordinates, win, fail) {
        cdApi.get('county_from_coordinates/' + coordinates, win, fail || topfail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdCountriesService', ['cdApi', cdCountriesService])
;
