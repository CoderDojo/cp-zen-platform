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
    update: function(user, win, fail) {
      user = angular.copy(user);
      cdApi.put('users/update/' + user.id, { user: user }, win, fail);
    },
    load: function(userId, win, fail) {
      cdApi.get('users/load/' + userId, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', cdUsersService]);
