'use strict';

function cdCharterService(cdApi){
    function topfail(err){
      console.log(err);
    }

    return {
      load: function(win, fail){
        cdApi.get('charter', win, fail || topfail);
      }
    }
  }
angular.module('cpZenPlatform')
  .service('cdCharterService', ['cdApi', cdCharterService])
;
