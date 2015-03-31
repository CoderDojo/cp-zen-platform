'use strict';

function cdCreateDojoCtrl($scope, $window, cdDojoService, alertService) {
    $scope.save = function(dojo) {
      cdDojoService.save(dojo, function(response) {
        alertService.showAlert("Your Dojo has been successfully saved", function() {
          $window.location.href = '/my-dojos'; 
        });
      }, function(err) {
        alertService.showError(
          'An error has occurred while saving: <br /> '+
          (err.error || JSON.stringify(err))
        );
      });
    }

    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    
    $scope.editorOptions = {
      language: 'en',
      uiColor: '#000000',
      height:'200px'
    };

  }

angular.module('cpZenPlatform')
  .controller('create-dojo-controller', ['$scope', '$window', 'cdDojoService', 'alertService', cdCreateDojoCtrl]);