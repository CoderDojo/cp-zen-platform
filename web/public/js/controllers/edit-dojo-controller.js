'use strict';
//TO DO: Move edit dojo controller into create-dojo-controller
function cdEditDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap, auth, $state, $q) {
  $scope.dojo = {};
  $scope.model = {};
  $scope.markers = [];
  $scope.saveButtonText = 'Update Dojo';

  auth.get_loggedin_user(function(user) {
    $scope.user = user;
  });

  function loadDojo() {
    return $q(function(resolve, reject) {
      var dojoId = $state.params.id;
      cdDojoService.load(dojoId, function(response) {
        if(!_.isEmpty(response)) {
          $scope.dojo = response;
          resolve();
        } else {
          reject('Failed to load Dojo');
        }
      });
    });
  }

  loadDojo().then(function() { 
    loadDojoMap();
  }, function (error) {
    alertService.showError(error);
  });
  
  function loadDojoMap() {
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
    $scope.dojoPageReady = true;
  }

  cdCountriesService.listCountries(function(response) {
    var countries = [];
    async.each(response, function(country, cb) {
      countries.push({countryName:country.countryName, geonameId:country.geonameId});
      cb();
    }, function() {
      $scope.countries = countries;
    });
    
  });

  $scope.getGeonameData = function($item, type) {
    var geonameId = $item.geonameId;
    cdCountriesService.loadChildren(geonameId, function(response) {
      var children = [];
      async.each(response, function(child, cb) {
        children.push({toponymName:child.toponymName, geonameId:child.geonameId});
        cb();
      }, function () {
        switch(type) {
          case 'states':
            $scope.dojo.state = '';
            $scope.dojo.county = '';
            $scope.dojo.city = '';
            $scope.states = children;
            break;
          case 'counties':
            $scope.dojo.county = '';
            $scope.dojo.city = '';
            $scope.counties = children;
            break;
          case 'cities':
            $scope.dojo.city = '';
            $scope.cities = children;
            break;
        }
      });
    });
  }
  
  $scope.save = function(dojo) {
    cdDojoService.save(dojo, function(response) {
      alertService.showAlert("Your Dojo has been successfully saved", function() {
        $location.path('/dashboard/my-dojos');
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
      if(!dojo.city) dojo.city = '';
      if(!dojo.county) dojo.county = '';
      if(!dojo.state) dojo.state = '';
      if(!dojo.country)  dojo.country  = '';
      var address = dojo.city.toponymName + ', ' + dojo.county.toponymName + ', ' + dojo.state.toponymName + ', ' + dojo.country.countryName;
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
  .controller('edit-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', 'auth', '$state', '$q', cdEditDojoCtrl]);
