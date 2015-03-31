'use strict'; 

function loadMyDojosService(cdDojoService) {
    var totalItems, fail;
    
    var loadMyDojos = function(config, currentUser, cb){
    
      fail = function(err) {
        cb(err);
      }

      cdDojoService.count(currentUser, function(count){
        totalItems = count;

        cdDojoService.search(config, currentUser,
          function(result){
            cb(null, {totalItems: count, myDojos: result});
          }, fail);
      }, fail);
    }

    return {loadMyDojos: loadMyDojos};
  }

angular.module('cpZenPlatform')
  .service('loadMyDojosService', ['cdDojoService', loadMyDojosService])
;
