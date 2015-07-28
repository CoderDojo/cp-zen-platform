'use strict';

function cdCountriesService($q, cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      listCountries: function(win, fail){
        cdApi.get('geo/countries', function (countries) {
          // Convert to array (and ensure array exists).
          countries = _.map(countries);
          // Sort based on browser/OS's locale.
          countries.sort(function (a, b){
            return a.countryName.localeCompare(b.countryName);
          });
          win(countries);
        }, fail || topfail);
      },
      listPlaces: function(search, win, fail) {
        cdApi.post('geo/places', {search: search}, win, fail || topfail);
      },
      loadContinentsLatLongData: function(win, fail) {
        cdApi.get('geo/continents_lat_long', win, fail || topfail);
      },
      loadCountriesLatLongData: function(win, fail) {
        cdApi.get('geo/countries_lat_long', win, fail || topfail);
      },
      loadCountriesContinents: function(win, fail) {
        cdApi.get('geo/countries_continents', win, fail || topfail);
      },
      getContinentCodes: function(win, fail){
        cdApi.get('geo/continent_codes', win, fail || topfail);
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdCountriesService', ['$q', 'cdApi', cdCountriesService])
;
