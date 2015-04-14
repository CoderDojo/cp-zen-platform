'use strict';

function manageDojosService(cdDojoService){
  var loadDojos = function(verfied, cb){
    cdDojoService.searchDojos({verified: 1}, function(response){
      return cb(null, response);
    },function(err){
      cb(err);
    });
  };

  return {loadDojos: loadDojos};
}

angular.module('cpZenPlatform')
  .service('dojoManagementService', ['cdDojoService', manageDojosService]);