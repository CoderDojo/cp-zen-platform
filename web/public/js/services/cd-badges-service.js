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
    },
    sendBadgeApplication: function (applicationData, win, fail) {
      cdApi.post('badges/applications', {applicationData: applicationData}, win, fail || topfail);
    },
    acceptBadge: function (badgeData, win, fail) {
      cdApi.post('badges/accept', {badgeData: badgeData}, win, fail || topfail);
    },
    loadUserBadges: function(userId, win, fail) {
      cdApi.get('badges/user/' + userId, win, fail || topfail);
    },
    loadBadgeCategories: function(win, fail) {
      cdApi.get('badge_categories', win, fail || topfail);
    },
    loadBadgeByCode: function(code, win, fail) {
      cdApi.post('badges/code', {code: code}, win, fail || topfail);
    },
    claimBadge: function(badge, win, fail) {
      cdApi.post('badges/claim', {badge: badge}, win, fail || topfail);
    },
    exportBadges: function(win, fail) {
      cdApi.get('export_badges', win, fail || topfail);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdBadgesService', ['cdApi', cdBadgesService]);