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
      myDojos: function (search, currentUser, win, fail) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/my_dojos', {search: search, user:currentUser}, resolve, reject);
        });
      },
      search: function(query) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/search', {query: query}, resolve, reject);
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
      dojosByCountry: function(query, win, fail) {
        cdApi.post('dojos_by_country', {query: query}, win, fail || topfail);
      },
      dojosStateCount: function(country, win, fail) {
        cdApi.get('dojos_state_count/' + country, win, fail || topfail);
      },
      bulkUpdate: function(dojos) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/bulk_update', {dojos: dojos}, resolve, reject);
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
        if(dojoLead.id) {
          cdApi.put('dojos/update_dojo_lead/' + dojoLead.id, { dojoLead: dojoLead }, win, fail || topfail);
        } else {
          cdApi.post('dojos/save_dojo_lead', { dojoLead: dojoLead }, win, fail || topfail);
        }
      },
      loadUserDojoLead: function(userId, win, fail) {
        cdApi.get('dojos/user_dojo_lead/' + userId, win, fail || topfail);
      },
      loadDojoLead: function(id, win, fail) {
        cdApi.get('dojos/dojo_lead/' + id, win, fail || topfail);
      },
      loadSetupDojoSteps: function(win, fail) {
        cdApi.get('load_setup_dojo_steps', win, fail || topfail);
      },
      getUsersDojos: function(query, win, fail) {
        cdApi.post('dojos/users', {query: query}, win, fail || topfail);
      },
      searchDojoLeads: function(query) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/search_dojo_leads', {query: query}, resolve, reject);
        });
      },
      getUsersDojosPromise: function(query){
        var deferred = $q.defer();
        cdApi.post('dojos/users', {query: query}, deferred.resolve, deferred.reject);
        return deferred.promise;
      },
      loadDojoUsers: function(query, win, fail) {
        cdApi.post('dojos/load_dojo_users', {query: query}, win, fail || topfail);
      },
      generateUserInviteToken: function(data, win, fail) {
        cdApi.post('dojos/generate_user_invite_token', data, win, fail || topfail);
      },
      acceptUserInvite: function(data, win, fail) {
        cdApi.post('dojos/accept_user_invite', { data: data }, win, fail || topfail);
      },
      requestInvite: function (data, win, fail) {
        cdApi.post('dojos/request_user_invite', { data: data }, win, fail || topfail);
      },
      acceptUserRequest: function(data, win, fail) {
        cdApi.post('dojos/accept_user_request', { data: data }, win, fail || topfail);
      },
      dojosForUser: function(userId, win, fail) {
        cdApi.get('dojos/dojos_for_user/' + userId, win, fail || topfail);
      },
      saveUsersDojos: function(userDojo, win, fail) {
        cdApi.post('dojos/save_usersdojos', {userDojo: userDojo}, win, fail || topfail);
      },
      removeUsersDojosLink: function(data, win, fail) {
        cdApi.post('dojos/remove_usersdojos/' + data.userId + '/' + data.dojoId, {data: data}, win, fail || topfail);
      },
      getUserPermissions: function(win, fail) {
        cdApi.get('get_user_permissions', win, fail || topfail);
      },
      getUserTypes: function(win, fail) {
        cdApi.get('get_user_types', win, fail || topfail);
      },
      uncompletedDojos: function(win, fail){
        cdApi.get('uncompleted_dojos', win, fail || topfail);
      },
      getDojoConfig: function(win, fail) {
        cdApi.get('get_dojo_config', win, fail || topfail);
      },
      updateFounder: function(founder, win, fail) {
        cdApi.post('update_founder', {founder: founder},  win, fail || topfail);
      },
      searchNearestDojos: function(query) {
        var deferred = $q.defer();
        cdApi.post('dojos/search_nearest_dojos', {query: query}, deferred.resolve, deferred.reject || topfail);
        return deferred.promise;
      },
      searchBoundingBox: function(query) {
        var deferred = $q.defer();
        cdApi.post('dojos/search_bounding_box', {query: query}, deferred.resolve, deferred.reject || topfail);
        return deferred.promise;
      },
      // from countries service
      listCountries: function(win, fail){
        cdApi.get('countries', function (countries) {
          // Convert to array (and ensure array exists).
          countries = _.map(countries);
          // Sort based on browser/OS's locale.
          countries.sort(function (a, b){
            var c = a.countryName.localeCompare(b.countryName);
            return c;
          });
          win(countries);
        }, fail || topfail);
      },
      listPlaces: function(search, win, fail) {
        cdApi.post('places', {search: search}, win, fail || topfail);
      },
      loadContinentsLatLongData: function(win, fail) {
        cdApi.get('continents_lat_long', win, fail || topfail);
      },
      loadCountriesLatLongData: function(win, fail) {
        cdApi.get('countries_lat_long', win, fail || topfail);
      },
      loadCountriesContinents: function(win, fail) {
        cdApi.get('countries_continents', win, fail || topfail);
      },
      getContinentCodes: function(win, fail){
        cdApi.get('continent_codes', win, fail || topfail);
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['$q', 'cdApi', cdDojoService])
;
