'use strict';

function cdUsersService(cdApi){
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
    isChampion: function(id, win, fail){
      cdApi.post('users/isChampion', {id: id}, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', cdUsersService]);
