'use strict';

function statsCtrl($scope, alertService, auth, cdAgreementsService, cdDojoService, $translate){
  $scope.load = function(){
    async.series([getContinentCodes, getCharters, getStats]);
  };

  function getCharters(cb){
    cdAgreementsService.count({agreement_version: 2},
      function(count){
        $scope.count = count;
        cb();
      },
      function(err){
        alertService.showError($translate.instant('An error has occurred while loading Dojos')
        );
        cb(err);
      });
  }

  function getStats(cb){
    cdDojoService.getStats(
      function(dojos){
        $scope.dojos = dojos;
        $scope.totals = computeTotals(dojos);
        cb();
      },
      function(err){
        alertService.showError($translate.instant('An error has occurred while loading Dojos'));
        cb(err);
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
    return totals;
  }

  function getContinentCodes(cb){
    cdDojoService.getContinentCodes(
      function(continentMap){
        $scope.continentMap = _.invert(continentMap);
        cb();
      },
      function(err){
        cb(err);
      }
    );
  }

  $scope.convertCode = function(code){
    return $scope.continentMap[code];
  };


  auth.get_loggedin_user(function(){
    $scope.load();
  });
}

angular.module('cpZenPlatform')
  .controller('stats-controller',['$scope', 'alertService', 'auth', 'cdAgreementsService', 'cdDojoService', '$translate', statsCtrl]);
