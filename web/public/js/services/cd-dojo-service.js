'use strict';
  function cdDojoService($q, cdApi, $http, Upload){
    function topfail(err){
      console.log(err);
    }
    var currentDojo = {};

    return {
      load: function(id, win, fail) {
        return cdApi.get('dojos/' + id, win, fail || topfail);
      },
      find: function(query, win, fail) {
        return cdApi.post('dojos/find', {query:query}, win, fail || topfail);
      },
      list: function(query, win, fail){
        return cdApi.post('dojos', {query:query}, win, fail || topfail);
      },
      myDojos: function (search, win, fail) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/my-dojos', {search: search}, resolve, reject);
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
          return cdApi.put('dojos/' + dojo.id, { dojo: dojo }, win, fail);
        }
        else {
          return cdApi.post('dojos/create', { dojo: dojo }, win, fail || topfail);
        }
      },
      uploadAvatar: function (dojoId, file){
        return Upload.upload({
          url: cdApi.baseUrl + 'dojos/' + dojoId + '/avatar',
          data: {file: file}
        });
      },
      // We should probably do that on the backend to avoid logging to console, srsly
      getAvatar: function(dojoId) {
        var bucketUrl = 'https://s3-eu-west-1.amazonaws.com/zen-dojo-images/' + dojoId;
        return $http.head('https://s3-eu-west-1.amazonaws.com/zen-dojo-images/' + dojoId).then(function successCallback(response) {
          //Nothing to do, it all works as expected, the image is stored online
          return bucketUrl;
        }, function errorCallback(response) {
          //File doesn't exists, we should fallback
          return $q.resolve('/img/avatars/dojo-default-logo.png');
        });
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
        return cdApi.delete('dojos/' + id, win, fail);
      },
      dojosByCountry: function(query, win, fail) {
        return cdApi.post('dojos/by-country', {query: query}, win, fail || topfail);
      },
      bulkUpdate: function(dojos) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/bulk-update', {dojos: dojos}, resolve, reject);
        });
      },
      bulkDelete: function(dojos){
        return $q(function(resolve, reject) {
          cdApi.post('dojos/bulk-delete', {dojos: dojos}, resolve, reject);
        });
      },
      getStats: function(win, fail){
        return cdApi.post('dojos/stats', {}, win,  fail || topfail);
      },
      // LEADS
      saveDojoLead: function(lead, win, fail) {
        return cdApi.post('dojos/lead', { lead: lead }, win, fail || topfail);
      },
      submitDojoLead: function (id, lead, win, fail) {
        return cdApi.put('dojos/lead/' + id, { lead: lead });
      },
      verify: function (id, verified) {
        return cdApi.patch('dojos/' + id + '/verified', {verified: verified});
      },
      loadDojoLead: function(id, win, fail) {
        return cdApi.get('dojos/lead/' + id, win, fail || topfail);
      },
      searchDojoLeads: function(query) {
        return cdApi.post('dojos/leads/search', {query: query});
      },
      loadSetupDojoSteps: function(win, fail) {
        return cdApi.get('dojos/setup-steps', win, fail || topfail);
      },
      //
      getUsersDojos: function(query, win, fail) {
        return cdApi.post('dojos/users', {query: query}, win, fail || topfail);
      },
      getUsersDojosPromise: function(query){
        var deferred = $q.defer();
        cdApi.post('dojos/users', {query: query}, deferred.resolve, deferred.reject);
        return deferred.promise;
      },
      loadDojoUsers: function(query, win, fail) {
        return cdApi.post('dojos/load-dojo-users', {query: query}, win, fail || topfail);
      },
      exportDojoUsers: function(dojoId, win, fail) {
        return cdApi.get('dojos/export-users/' + dojoId + '-user-export.csv', win, fail || topfail);
      },
      generateUserInviteToken: function(data, win, fail) {
        return cdApi.post('dojos/generate-user-invite-token', data, win, fail || topfail);
      },
      acceptUserInvite: function(data, win, fail) {
        return cdApi.post('dojos/accept-user-invite', { data: data }, win, fail || topfail);
      },
      requestInvite: function (data, win, fail) {
        return cdApi.post('dojos/request-user-invite', { data: data }, win, fail || topfail);
      },
       // dojoId is optional, it's more to respect the url format
      acceptUserRequest: function (dojoId, inviteToken, requestedByUser, win, fail) {
        return cdApi.put('dojos/' + dojoId + '/request/' + inviteToken + '/user/' + requestedByUser, null, win, fail || topfail);
      },
       // dojoId is optional, it's more to respect the url format
      declineUserRequest: function (dojoId, inviteToken, requestedByUser, win, fail) {
        return cdApi.delete('dojos/' + dojoId + '/request/' + inviteToken + '/user/' + requestedByUser, win, fail || topfail);
      },
      dojosForUser: function(userId, win, fail) {
        return cdApi.get('dojos/dojos-for-user/' + userId, win, fail || topfail);
      },
      saveUsersDojos: function(userDojo, win, fail) {
        return cdApi.post('dojos/save-usersdojos', {userDojo: userDojo}, win, fail || topfail);
      },
      removeUsersDojosLink: function(data, win, fail) {
        return cdApi.post('dojos/remove-usersdojos/' + data.userId + '/' + data.dojoId, {data: data}, win, fail || topfail);
      },
      getUserPermissions: function(win, fail) {
        return cdApi.get('dojos/user-permissions', win, fail || topfail);
      },
      getUserTypes: function(win, fail) {
        return cdApi.get('dojos/user-types', win, fail || topfail);
      },
      uncompletedDojos: function(win, fail){
        return cdApi.get('dojos/uncompleted', win, fail || topfail);
      },
      getDojoConfig: function(win, fail) {
        return cdApi.get('dojos/config', win, fail || topfail);
      },
      updateFounder: function(founder, win, fail) {
        return cdApi.post('dojos/update-founder', {founder: founder},  win, fail || topfail);
      },
      searchNearestDojos: function(query) {
        var deferred = $q.defer();
        cdApi.post('dojos/search-nearest-dojos', {query: query}, deferred.resolve, deferred.reject || topfail);
        return deferred.promise;
      },
      searchBoundingBox: function(query) {
        return $q(function(resolve, reject) {
          cdApi.post('dojos/search-bounding-box', {query: query}, resolve, reject);
        });
      },
      // from countries service
      listCountries: function(win, fail){
        return cdApi.get('countries', function (countries) {
          // Sort based on browser/OS's locale.
          countries.sort(function (a, b){
            var c = a.countryName.localeCompare(b.countryName);
            return c;
          });
          win(countries);
        }, fail || topfail);
      },
      listPlaces: function(search, win, fail) {
        return cdApi.post('countries/places', {search: search}, win, fail || topfail);
      },
      loadCountriesLatLongData: function(win, fail) {
        return cdApi.get('countries/lat-long', win, fail || topfail);
      },
      getContinentCodes: function(win, fail){
        return cdApi.get('countries/continents/codes', win, fail || topfail);
      },
      notifyAllMembers: function (data, win, fail) {
        return cdApi.post('dojos/notify-all-members', { data: data }, win, fail || topfail);
      },
      sendEmail: function (dojoId, email, win, fail) {
        return cdApi.post('dojos/' + dojoId + '/users/notifications', email, win, fail || topfail);
      },
      searchDojoInvites: function (dojoId, query) {
        return cdApi.get('dojos/' + dojoId + '/requests', null, null, {params: query});
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdDojoService', ['$q', 'cdApi', '$http', 'Upload', cdDojoService])
;
