'use strict';
  function cdLMSService($q, cdApi, $http){
    function topfail(err){
      console.log(err);
    }

    return {
      getLoginURL: function(data, win, fail) {
        var url = 'users/lms/user';
        if (data && data.approval) url += '?approval=' + data.approval;
        cdApi.get(url, win, fail || topfail);
      }
    };
  }
angular.module('cpZenPlatform')
  .service('cdLMSService', ['$q', 'cdApi', '$http', cdLMSService])
;
