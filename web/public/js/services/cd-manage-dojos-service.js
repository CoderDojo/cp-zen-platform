'use strict';

//TODO: return charter agreement

function manageDojosService(cdDojoService, cdUsersService){
  var loadDojos = function(verified, cb){
    cdDojoService.searchDojos({verified: verified}, function(dojos){
      var userIds = _.pluck(dojos, "creator");
      
      cdUsersService.getEmailsByIds(userIds, function(users){
        
        var emailsIdx = _.indexBy(users, 'id');
        
        var mappedDojos = _.map(dojos, function(dojo){
          dojo.creatorEmail = emailsIdx[dojo.creator].email;
          return dojo;
        });

        console.log(mappedDojos);
        return cb(null, mappedDojos);

      }, function(response){
        console.log(response);
      });

    },function(err){
      cb(err);
    });
  };

  var bulkUpdate = function(dojos, cb){
    cdDojoService.bulkUpdate({dojos:dojos}, function(response){
      return cb(null, response);
    }, function(err){
      cb(err);
    });
  };


  return {
    loadDojos: loadDojos,
    bulkUpdate: bulkUpdate
  };
}

angular.module('cpZenPlatform')
  .service('dojoManagementService', ['cdDojoService', 'cdUsersService', manageDojosService]);