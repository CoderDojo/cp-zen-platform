'use strict';

angular.module('cpZenPlatform').controller('logout', ['$state', '$window', '$cookieStore', 'auth', logoutCtrl]);

function logoutCtrl($state, $window, $cookieStore, auth) {
    $cookieStore.remove('verifyProfileComplete');
    $cookieStore.remove('canViewYouthForums');
    auth.logout(function(data){
      var referer = decodeURIComponent($state.params.referer);
      if (referer.match(/https?:\/\/[^\/]+\/dashboard/)) {
        $window.location.href = 'https://coderdojo.com/';
      } else {
        $window.location.href = referer;
      }
    });
}
