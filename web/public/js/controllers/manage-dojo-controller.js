'use strict';

function manageDojos($scope, dojoManagementService, alertService, auth) {
  $scope.filterValue = 1;

  var verficationStates = [
    {label: 'Unverified', value: 0},
    {label: 'Verified', value: 1},
    {label: 'Previous', value: 2}
  ]

  $scope.getVerificationStates = function(isSigned){
    return isSigned ? verficationStates : [verficationStates[0], verficationStates[2]];
  }

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
  };

  auth.get_loggedin_user(function(user){
    $scope.loadPage(1, true);
  });
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller', 
  ['$scope', 'dojoManagementService', 'alertService', 'auth', manageDojos]);

