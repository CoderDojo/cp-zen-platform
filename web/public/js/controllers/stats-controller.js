'use strict';

function statsCtrl($scope, dojoManagementService, alertService, auth, cdAgreementsService){
  $scope.load = function(){
    getCharters();
  };

  function getCharters(){
    cdAgreementsService.count({agreement_version: 2}, 
      function(count){
        $scope.count = count;
      }, 
      function(err){
          alertService.showError('An error has occurred while loading Dojos: <br>' +
            (err.error || JSON.stringify(err))
          );
      });
  }


  auth.get_loggedin_user(function(){
    $scope.load();
  });
}

angular.module('cpZenPlatform')
  .controller('stats-controller',['$scope', 'dojoManagementService', 'alertService', 'auth', 'cdAgreementsService', statsCtrl]);