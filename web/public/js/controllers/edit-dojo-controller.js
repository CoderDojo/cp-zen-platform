'use strict';

function cdEditDojoCtrl($scope, $window, $location, cdDojoService, alertService) {
    $scope.save = function(dojo) {
      cdDojoService.save(dojo, function(response) {
        alertService.showAlert("Your Dojo has been successfully saved", function() {
          $location.path('/my-dojos');
          $scope.$apply();
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

    cdDojoService.getDojoToEdit(function(response) {
      if(response) return $scope.dojo = response;
    }, function(err) {
        alertService.showError(
          'An error has occurred while saving: <br /> '+
          (err.error || JSON.stringify(err))
        );
      });
  
  }

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'alertService', cdEditDojoCtrl]);