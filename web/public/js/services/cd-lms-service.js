'use strict';
  function cdLMSService($q, cdApi, $http){
    function topfail(err){
      console.log(err);
    }

    return {
      getLoginURL: function(win, fail) {
        cdApi.get('users/lms/user', win, fail || topfail);
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdLMSService', ['$q', 'cdApi', '$http', cdLMSService])
;
