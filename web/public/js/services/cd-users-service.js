'use strict';

function cdUsersService(cdApi, $q){
  function topfail(err){
    console.log(err);
  }

  return {
    promote: function(id, roles, win, fail) {
      cdApi.put('users/promote/' + id, {roles:roles}, win, fail || topfail);
    },
    getUsersByEmails: function(email, win, fail) {
      cdApi.post('users/emails', {email: email}, win, fail || topfail);
    },
    getInitUserTypes: function(win, fail) {
      cdApi.get('users/init-user-types', win, fail || topfail);
    },
    getInitUserTypesPromise: function() {
      var deferred = $q.defer();
      var promise = deferred.promise;

      cdApi.get('users/init-user-types', deferred.resolve, deferred.reject || topfail);

      return promise;
    },
    userProfileData: function(query, win, fail) {
      cdApi.post('profiles/user-profile-data', {query: query}, win, fail || topfail);
    },
    userProfileDataPromise: function (query) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      cdApi.post('profiles/user-profile-data', {query:query}, deferred.resolve, deferred.reject || topfail);
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
    },
    inviteParent: function(data, win, fail) {
      cdApi.post('profiles/invite-parent-guardian', {data: data}, win, fail || topfail);
    },
    acceptParent: function(data, win, fail) {
      cdApi.post('profiles/accept-parent-guardian', {data: data}, win, fail || topfail);
    },
    getHiddenFieldsPromise: function(win, fail){
      var deferred = $q.defer();
      var promise = deferred.promise;

      cdApi.get('profiles/hidden-fields', deferred.resolve, deferred.reject || topfail);

      return promise;
    },
    isChampion: function(id, win, fail){
      cdApi.post('users/is-champion', {id: id}, win, fail || topfail);
    },
    getAvatar: function(id, win, fail){
      cdApi.get('profiles/' + id + '/avatar', win, fail || topfail);
    },
    loadChampionsForUser: function(userId, win, fail) {
      cdApi.get('users/champions-for-user/' + userId, win, fail || topfail);
    },
    loadUserProfile: function(userId, win, fail) {
      cdApi.get('profiles/load-user-profile/' + userId, win, fail || topfail);
    },
    loadChampionsForUserPromise: function (userId) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      cdApi.get('users/champions-for-user/' + userId, deferred.resolve, deferred.reject || topfail);
      return promise;
    },
    loadParentsForUserPromise: function (userId) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      cdApi.get('profiles/parents-for-user/' + userId, deferred.resolve, deferred.reject || topfail);
      return promise;
    },
    loadDojoAdminsForUserPromise: function (userId) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      cdApi.get('users/dojo-admins-for-user/' + userId, deferred.resolve, deferred.reject || topfail);
      return promise;
    },
    inviteNinja: function (ninjaData, win, fail) {
      cdApi.post('profiles/invite-ninja', {ninjaData: ninjaData}, win, fail || topfail);
    },
    approveInviteNinja: function (data, win, fail) {
      cdApi.post('profiles/approve-invite-ninja', {data: data}, win, fail || topfail);
    },
    loadNinjasForUser: function (userId, win, fail) {
      cdApi.get('profiles/ninjas-for-user/' + userId, win, fail || topfail);
    },
    loadPrevFounder: function(userId, win, fail) {
      cdApi.get('users/load-previous-founder/' + userId, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', '$q',cdUsersService]);
