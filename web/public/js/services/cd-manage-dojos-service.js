'use strict';

//TODO: return charter agreement

function manageDojosService(cdDojoService){
  var loadDojos = function(verified, cb){
    cdDojoService.searchDojos({verified: verified}, function(response){
      return cb(null, response);
    },function(err){
      cb(err);
    });
  };

  return {loadDojos: loadDojos};
}

angular.module('cpZenPlatform')
  .service('dojoManagementService', ['cdDojoService', manageDojosService]);