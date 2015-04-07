'use strict';

function cdCreateDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap) {
  $scope.dojo = {};
  $scope.model = {};
  $scope.saveButtonText = 'Create Dojo';

  cdCountriesService.list(function(response) {
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
            $scope.dojo.state = undefined;
            $scope.dojo.county = undefined;
            $scope.dojo.city = undefined;
            $scope.states = children;
            break;
          case 'counties':
            $scope.dojo.county = undefined;
            $scope.dojo.city = undefined;
            $scope.counties = children;
            break;
          case 'cities':
            $scope.dojo.city = undefined;
            $scope.cities = children;
            break;
        }
      });
    });
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
  
}

angular.module('cpZenPlatform')
  .controller('create-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', cdCreateDojoCtrl]);