'use strict';

function manageDojos($scope, dojoManagementService, alertService, auth) {
  $scope.loadPage = function(currentUser, verified, resetFlag, cb){
    cb = cb || function(){};
    console.log("requested dojos");

    dojoManagementService.loadDojos(verified, function(err, results){
      if(err){
        alertService.showError('An error has occurred while loading Dojos: <br>' +
          (err.error || JSON.stringify(err))
        );
      }

      $scope.dojos = results;
      console.log(results[0]);
      console.log(results[1]);
      return cb();
    });
  };

  auth.get_loggedin_user(function(user){
    $scope.loadPage(user, true);
  });
}

angular.module('cpZenPlatform')
  .controller('manage-dojo-controller', 
  ['$scope', 'dojoManagementService', 'alertService', 'auth', manageDojos]);