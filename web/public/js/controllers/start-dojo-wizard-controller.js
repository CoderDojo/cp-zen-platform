 'use strict';

function startDojoWizardCtrl($scope, $window, $state, $stateParams, $location, auth, alertService, WizardHandler, cdDojoService) {
    var step = parseInt($stateParams.step);
    var registeredSuccessfully = false;
    var championApplicationSent = false;

    $scope.$watch(function() {
      return WizardHandler.wizard();
    }, function (wizard) {
      if (wizard) {
        switch(step) {
          case 0:
            auth.get_loggedin_user(function (user) {
              if(user) $location.path('/dashboard/start-dojo/1');
            });
            break;
          case 1:
            auth.get_loggedin_user(function (user) {
              if(user) {
                registeredSuccessfully = true;
                wizard.goTo(step);
              }
            });
            break;
          case 2:
            auth.get_loggedin_user(function (user) {
              if(user) {
                cdDojoService.loadUserDojoLead(user.id, function(response) {
                  if(!_.isEmpty(response)) {
                    registeredSuccessfully = true;
                    championApplicationSent = true;
                    wizard.goTo(step);
                  } else {
                    $location.path('/dashboard/start-dojo/1');
                  }
                })
              }
            });
            break;
        }
      }
    });

    //--Step One:
    $scope.doRegister = function(user) {
      auth.register(user, function(data) {
        if(data.ok) {
          auth.login(user, function(data) {
            registeredSuccessfully = true;
            //Login to dashboard:
            $window.location.href = '/dashboard/start-dojo/1';
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
    //--

    //--Step Two:
    var currentUser;
    $scope.champion = {};
    auth.get_loggedin_user(function (user) {
      currentUser = user;
      if(currentUser) {
        $scope.champion.email = currentUser.email;
        $scope.champion.name = currentUser.name;
      }
    });

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.today = new Date();

    $scope.answers = ['Yes', 'No'];

    $scope.save = function(champion) {
      var dojoLead = {};
      dojoLead.application = champion;
      dojoLead.userId = currentUser.id;
      dojoLead.email = currentUser.email;

      cdDojoService.saveDojoLead(dojoLead, function(response) {
        alertService.showAlert('Champion Application Saved Successfully!');
        $location.path('/dashboard/start-dojo/2');
      });
    }

    $scope.championApplicationSubmitted = function () {
      if(championApplicationSent) return true;
      return false;
    }
    //--
}

angular.module('cpZenPlatform')
    .controller('start-dojo-wizard-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'auth', 'alertService', 'WizardHandler', 'cdDojoService', startDojoWizardCtrl]);