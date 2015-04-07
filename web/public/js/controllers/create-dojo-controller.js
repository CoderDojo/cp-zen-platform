'use strict';

function cdCreateDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap) {
  $scope.dojo = {};
  $scope.model = {};
  $scope.saveButtonText = 'Create Dojo';

  cdCountriesService.list(function(response) {
    var countries = [];
    async.each(response, function(country, cb) {
      countries.push(country.countryName);
      cb();
    }, function() {
      $scope.countries = countries;
    });
    
  });

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
 
  $scope.markers = [];

  if(gmap) {
    $scope.mapLoaded = true;
    $scope.mapOptions = {
      center: new google.maps.LatLng(53.344415, -6.260147),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
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

  var initContent = "<p><ul> \
    <li>A pack lunch</li> \
    <li>A laptop. Borrow one from somebody if needs be.</li> \
    <li><b>A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.</b></li> \
    </ul></p>";

  $scope.editorOptions = {
    language: 'en',
    uiColor: '#000000',
    height:'200px',
    initContent:initContent
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
  
}

angular.module('cpZenPlatform')
  .controller('create-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', cdCreateDojoCtrl]);