 'use strict';

function startDojoWizardCtrl($scope, auth, alertService, WizardHandler) {
    var registeredSuccessfully = false;
    //Step One:
    $scope.doRegister = function(user) {
      auth.register(user, function(data) {
        if(data.ok) {
          alertService.showAlert('Thank You for Registering. Your Coder Dojo Account has been successfully created. You can now Register to become a Champion and Create a Dojo.', function() {
            auth.login(user, function(data) {
              registeredSuccessfully = true;
              WizardHandler.wizard().next();
            });
          });
        } else {
          alertService.showAlert('There was a problem registering your account:' + data.why);
          registeredSuccessfully = false;
        }
      }, function() {
        
      });
    }

    $scope.accountSuccessfullyRegistered = function () {
      if(registeredSuccessfully) return true;
      return false;      
    }
}

angular.module('cpZenPlatform')
    .controller('start-dojo-wizard-controller', ['$scope', 'auth', 'alertService', 'WizardHandler', startDojoWizardCtrl]);