'use strict';

function statsCtrl($scope, dojoManagementService, alertService, auth, cdAgreementsService, cdDojoService){
  $scope.load = function(){
    getCharters();
    getStats();
  };

  $scope.continentMap = {
    "NA": "North America",
    "SA": "South America",
    "AU": "Australia",
    "EU": "Europe",
    "AS": "Asia",
    "AF": "Africa",
    "OC": "Oceania"
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

  function getStats(){
    cdDojoService.getStats(
      function(dojos){
        
        $scope.dojos = dojos;
        $scope.totals = computeTotals(dojos);

      },
      function(err){
        alertService.showError('An error has occurred while loading Dojos: <br>' +
          (err.error || JSON.stringify(err))
        );        
      }
    );
  }

  function computeTotals(dojos){
    var totals = {}, overallTotal = {}, firstIteration = true;

    _.forEach(dojos, function(n, key) {
      var total = {}; 
      
      var allValues = _.pluck(n, 'all');
      var verifiedValues = _.pluck(n, 'verified');
      var activeValues = _.pluck(n, 'activeVerified');

      for(var i = 0; i < n.length ; i++){
        total.all = total.all ? total.all : 0;
        total.all = +allValues[i] + total.all;
        
        total.verified = total.verified ? total.verified : 0;
        total.verified = +verifiedValues[i] + total.verified;

        total.active = total.active ? total.active : 0;
        total.active = +activeValues[i] + total.active;
      }
      
      totals[key] = total;
      
      if(firstIteration){
        overallTotal.all = 0;
        overallTotal.verified = 0;
        overallTotal.active = 0;
      }

      overallTotal.all = total.all + overallTotal.all;
      overallTotal.verified = total.verified + overallTotal.verified;
      overallTotal.active = total.active + overallTotal.active;

      firstIteration = false;
    });

    totals.overallTotal = overallTotal;

    console.log("totals", totals);
    return totals;
  }


  auth.get_loggedin_user(function(){
    $scope.load();
  });
}

angular.module('cpZenPlatform')
  .controller('stats-controller',['$scope', 'dojoManagementService', 'alertService', 'auth', 'cdAgreementsService', 'cdDojoService', statsCtrl]);