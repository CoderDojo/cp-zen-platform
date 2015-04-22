'use strict';

function cdUsersService(cdApi){
  function topfail(err){
    console.log(err);
  }

  return {
    getEmailsByIds: function(ids, win, fail){
      cdApi.post('users/emails', {usersIds: ids}, win, fail || topfail);
    },
    promoteUser: function(id, roles, win, fail) {
      cdApi.put('users/promote/' + id, {roles:roles}, win, fail || topfail);
    }
  }
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', cdUsersService]);