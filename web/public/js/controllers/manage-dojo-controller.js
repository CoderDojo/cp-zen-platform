'use strict';

function manageDojos($scope, dojoManagementService, alertService, auth) {
  $scope.filterValue = 1;

  var verficationStates = [
    {label: 'Unverified', value: 0},
    {label: 'Verified', value: 1},
    {label: 'Previous', value: 2}
  ]

  var changedDojos = [];

  $scope.getVerificationStates = function(isSigned){
    return isSigned ? verficationStates : [verficationStates[0], verficationStates[2]];
  };

  $scope.loadPage = function(verified, resetFlag, cb){
    cb = cb || function(){};

    dojoManagementService.loadDojos(verified, function(err, results){
      if(err){
        alertService.showError('An error has occurred while loading Dojos: <br>' +
          (err.error || JSON.stringify(err))
        );
      }

      $scope.dojos = _.map(results, function(dojo){
        dojo.verified = _.findWhere(verficationStates, {value: dojo.verified});
        return dojo;
      }); 

      return cb();
    });
  };

  $scope.filterDojos =  function(){
    $scope.loadPage(+$scope.filterValue, true);
    changedDojos = [];
  };

  $scope.updateDojos = function(){
    var dojosToBeDeleted, dojosToBeUpdated;

    dojosToBeDeleted = _.filter(changedDojos, function(changedDojo){
      return changedDojo.toBeDeleted;
    });

    dojosToBeUpdated = _.filter(changedDojos, function(changedDojo){
      return !changedDojo.toBeDeleted;
    });

    console.log("dojosToBeUpdated", dojosToBeUpdated);
    console.log("dojosToBeDeleted", dojosToBeDeleted);
  };

  $scope.pushChangedDojo = function(dojo){
    var exists = !!(_.find(changedDojos, function(changedDojo){ 
                      return dojo.id === changedDojo.id;
                    }));

    


    if((dojo.verified.value !== $scope.filterValue) || (dojo.toBeDeleted)){
      if(!exists){
        changedDojos.push(dojo);
      }

    } else if(dojo.verified.value === $scope.filterValue && !dojo.toBeDeleted) {
      changedDojos =  _.filter(changedDojos, function(filteredDojo){
                        return dojo.id !== filteredDojo.id;
                      }); 
    }

    console.log("changedDojos", changedDojos);
  };

  auth.get_loggedin_user(function(user){
    $scope.loadPage(1, true);
  });
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller', 
  ['$scope', 'dojoManagementService', 'alertService', 'auth', manageDojos]);

