'use strict';
  function cdDojoService($q, cdApi){
    function topfail(err){
      console.log(err);
    }
    var currentDojo = {};
    return {
      load: function(id, win, fail) {
        cdApi.get('dojos/' + id, win, fail || topfail);
      },
      find: function(query, win, fail) {
        cdApi.post('dojos/find', {query:query}, win, fail || topfail);
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
      searchDojos: function(search) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/search', {search: search}, resolve, reject);
        });
      },
      save: function(dojo, win, fail) {
        dojo = angular.copy(dojo);
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
      dojosStateCount: function(country, win, fail) {
        cdApi.get('dojos_state_count/' + country, win, fail || topfail);
      },
      bulkUpdate: function(dojos) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/bulk_update', dojos, resolve, reject);
        });
      },
      dojoSearchCount: function(query, win, fail){
        cdApi.post('dojos/search_count', query, win, fail || topfail);
      },
      bulkDelete: function(dojos){
        return $q(function(resolve, reject) {
          cdApi.post('dojos/bulk_delete', {dojos: dojos}, resolve, reject);
        });
      },
      getStats: function(win, fail){
        cdApi.post('dojos/stats', {}, win,  fail || topfail);
      },
      saveDojoLead: function(dojoLead, win, fail) {
        cdApi.post('dojos/save_dojo_lead', { dojoLead: dojoLead}, win, fail || topfail);
      },
      loadUserDojoLead: function(userId, win, fail) {
        cdApi.get('dojos/user_dojo_lead/' + userId, win, fail || topfail);
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['$q', 'cdApi', cdDojoService])
;
