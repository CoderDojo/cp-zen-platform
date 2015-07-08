'use strict'

function cdBadgesService(cdApi) {
  function topfail(err){
    console.log(err);
  }
  return {
    listBadges: function(win, fail) {
      cdApi.get('badges', win, fail || topfail);
    },
    getBadge: function(slug, win, fail) {
      cdApi.get('badges/' + slug, win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdBadgesService', ['cdApi', cdBadgesService]);