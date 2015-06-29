'use strict';

function cdSetupDojoCtrl($scope, $window, $state, cdDojoService, alertService, $q) {

  function loadDojoLead() {
    return $q(function(resolve, reject) {
      var dojoLeadId = $state.params.id;
      cdDojoService.loadDojoLead(dojoLeadId, function(response) {
        if(!_.isEmpty(response)) {
          $scope.dojoLead = response;
          resolve();
        } else {
          reject('Failed to load Dojo');
        }
      });
    });
  }

  loadDojoLead().then(function() {
      cdDojoService.loadSetupDojoSteps(function (response) {
        $scope.steps = response;

        $scope.steps.map(function(step){
          step.open = true;
        });
      });
    },
    function (error) {
    alertService.showError(error);
  });

  $scope.submitSetupYourDojo = function (dojoLead) {
    cdDojoService.saveDojoLead(dojoLead, function() {
      $window.location.href = '/dashboard/my-dojos';
    });
  }
}

angular.module('cpZenPlatform')
  .controller('setup-dojo-controller', ['$scope', '$window', '$state', 'cdDojoService', 'alertService', '$q', cdSetupDojoCtrl]);
