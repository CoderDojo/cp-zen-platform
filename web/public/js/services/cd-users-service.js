'use strict';

function cdUsersService(cdApi, $q){
  function topfail(err){
    console.log(err);
  }

  return {
    list: function(ids, win, fail){
      cdApi.post('users/list', {ids: ids}, win, fail || topfail);
    },
    promote: function(id, roles, win, fail) {
      cdApi.put('users/promote/' + id, {roles:roles}, win, fail || topfail);
    },
    getUsersByEmails: function(email, win, fail) {
      cdApi.post('users/emails', {email: email}, win, fail || topfail);
    },
    update: function(user, win, fail) {
      user = angular.copy(user);
      cdApi.put('users/update/' + user.id, { user: user }, win, fail);
    },
    load: function(userId, win, fail) {
      cdApi.get('users/load/' + userId, win, fail || topfail);
    },
    getInitUserTypes: function(win, fail) {
      cdApi.get('users/init_user_types', win, fail || topfail);
    },
    listProfiles: function(query, win, fail) {
      cdApi.post('profiles', {query:query}, win, fail || topfail);
    },
    listProfilesPromise: function(query){
      var deferred = $q.defer();
      var promise = deferred.promise;

      cdApi.post('profiles', {query:query}, deferred.resolve, deferred.reject || topfail);

      return promise;
    },
    saveProfile: function(profile, win, fail) {
      cdApi.post('profiles/create', {profile: profile}, win, fail || topfail);
    },
    saveYouthProfile: function(profile, win, fail) {
      if(profile.id){
        cdApi.put('profiles/youth/update', {profile: profile}, win, fail || topfail);
      } else{
        cdApi.post('profiles/youth/create', {profile: profile}, win, fail || topfail);
      }
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', '$q',cdUsersService]);
