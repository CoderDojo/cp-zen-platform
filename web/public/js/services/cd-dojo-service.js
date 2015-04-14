'use strict'; 
  function cdDojoService(cdApi){
    function topfail(err){
      console.log(err);
    }
    var currentDojo = {};
    return {
      load: function(id, win, fail) {
        cdApi.get('dojos/' + id, win, fail || topfail);
      },
      list: function(query, win, fail){
        cdApi.post('dojos', {query:query}, win, fail || topfail);
      },
      count: function(currentUser, win, fail){
        cdApi.post('dojos/my_dojos_count', {user: currentUser}, win, fail || topfail);
      },
      search: function (query, currentUser, win, fail) {
        cdApi.post('dojos/my_dojos_search', {query: query, user:currentUser}, win, fail || topfail);
      },
      searchDojos: function(query, win, fail) {
        cdApi.post('dojos/search', {query: query}, win, fail || topfail);
      },
      save: function(dojo, win, fail) {
        if (dojo.id) {
          cdApi.put('dojos/' + dojo.id, { dojo: dojo }, win, fail);
        }
        else {
          cdApi.post('dojo_create', { dojo: dojo }, win, fail || topfail);
        } 
      },
      setDojo: function(dojo, win, fail) {
        currentDojo = dojo;
        if(currentDojo) return win(currentDojo); 
        var err = new Error('Set Dojo Failed');
        fail(err);
      },
      getDojo: function() {
        return currentDojo;
      },
      delete: function(id, win, fail) {
        cdApi.delete('dojos/' + id, win, fail);
      },
      dojoCount: function(win, fail) {
        cdApi.get('dojos_count', win, fail || topfail);
      },
      dojosByCountry: function(countries, win, fail) {
        cdApi.post('dojos_by_country', {countries:countries}, win, fail || topfail);
      },
      dojosCountyCount: function(country, win, fail) {
        cdApi.get('dojos_county_count/' + country, win, fail || topfail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['cdApi', cdDojoService])
;
