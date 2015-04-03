'use strict';

function cdEditDojoCtrl($scope, $window, $location, cdDojoService, alertService, Geocoder, gmap) {
  $scope.dojo = cdDojoService.getDojoToEdit();
  $scope.model = {};
  $scope.markers = [];
  $scope.saveButtonText = 'Update Dojo';

  $scope.$watch('model.map', function(map){
    if(map) {
      var marker = new google.maps.Marker({
        map: $scope.model.map,
        position: new google.maps.LatLng(latitude, longitude)
      });
      $scope.markers.push(marker);
    }
  });

  if(gmap) {
    $scope.mapLoaded = true;
    var coordinates = $scope.dojo.coordinates.split(',');
    var latitude  = coordinates[0];
    var longitude = coordinates[1];

    $scope.mapOptions = {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

  }

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
      map: $scope.model.map,
      position: $params[0].latLng
    }));
    $scope.dojo.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
  };

  $scope.getLocationFromAddress = function(dojo) {
    if(dojo) {
      if(!dojo.address1) dojo.address1 = '';
      if(!dojo.address2) dojo.address2 = '';
      if(!dojo.country)  dojo.country  = '';
      var address = dojo.address1 + ', ' + dojo.address2 + ', ' + dojo.country;
      Geocoder.latLngForAddress(address).then(function (data) {
        $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
        $scope.model.map.panTo($scope.mapOptions.center);
      });
    }
  }
  
  $scope.editorOptions = {
    language: 'en',
    uiColor: '#000000',
    height:'200px'
  };

}

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'alertService', 'Geocoder', 'gmap', cdEditDojoCtrl]);