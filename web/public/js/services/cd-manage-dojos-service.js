'use strict';

function manageDojosService(cdDojoService, cdUsersService, cdAgreementsService){
 
  var loadDojos = function(query, cb){
    cdDojoService.searchDojos(query, function(dojos){
      var userIds = _.pluck(dojos, "creator");
      if(userIds.length === 0){
        return cb("No results found");
      }

      cdUsersService.getEmailsByIds(userIds, function(users){
        
        var emailsIdx = _.indexBy(users, 'id');

        cdAgreementsService.getAgreementsByIds(userIds, function(agreements){
          var mappedAgreements = _.map(agreements, function(agreement){
            return agreement ? agreement : {};
          }); 

          var mappedDojos = _.map(dojos, function(dojo){
            dojo.creatorEmail = emailsIdx[dojo.creator] && emailsIdx[dojo.creator].email;
            dojo.agreements = _.findWhere(mappedAgreements, {userId: dojo.creator, agreementVersion: 2});
            return dojo;
          });

          var countQuery = _.omit(query, ['limit', 'skip']);
          cdDojoService.dojoSearchCount({query: countQuery}, function(results){
            return cb(null, {dojos: mappedDojos, totalItems: results.totalItems});

          }, function(err){
            cb(err);
          });

        }, function(err){
          cb(err);
        });
        

      }, function(err){
        cb(err);
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

  var bulkDelete = function(dojos, cb){
    cdDojoService.bulkDelete(dojos, function(response){
      return cb(null, response);
    }, function(err){
      return cb(err);
    });
  };


  return {
    loadDojos: loadDojos,
    bulkUpdate: bulkUpdate,
    bulkDelete: bulkDelete
  };
}

angular.module('cpZenPlatform')
  .service('dojoManagementService', ['cdDojoService', 'cdUsersService', 'cdAgreementsService', manageDojosService]);