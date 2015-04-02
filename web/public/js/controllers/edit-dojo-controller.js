'use strict';

function cdEditDojoCtrl($scope, $window, $location, cdDojoService, alertService) {
  $scope.dojo = cdDojoService.getDojoToEdit();
  var coordinates = $scope.dojo.coordinates.split(',');
  var latitude  = coordinates[0];
  var longitude = coordinates[1];

  $scope.mapOptions = {
    center: new google.maps.LatLng(latitude, longitude),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

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

    $scope.addMarker = function($event, $params) {
      angular.forEach($scope.markers, function(marker) {
        marker.setMap(null);
      });
      $scope.markers.push(new google.maps.Marker({
        map: $scope.map,
        position: $params[0].latLng
      }));
      $scope.dojo.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
    };
    
    $scope.editorOptions = {
      language: 'en',
      uiColor: '#000000',
      height:'200px'
    };

  }

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'alertService', cdEditDojoCtrl]);