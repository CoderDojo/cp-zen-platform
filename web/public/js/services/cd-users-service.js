'use strict';

function cdUsersService(cdApi){
  function topfail(err){
    console.log(err);
  }

  return {
    getEmailsByIds: function(ids, win, fail){
      cdApi.post('users/emails', {usersIds: ids}, win, fail || topfail);
    }
  }
}

angular.module('cpZenPlatform')
  .service('cdUsersService', ['cdApi', cdUsersService]);