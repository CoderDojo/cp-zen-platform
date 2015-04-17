'use strict';

function cdCreateDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap) {
  $scope.dojo = {};
  $scope.model = {};
  $scope.saveButtonText = 'Create Dojo';

  cdCountriesService.listCountries(function(countries) {
    $scope.countries = _.map(countries, function(country) {
      return _.omit(country, 'entity$');
    });
  });

  $scope.getPlaces = function(countryCode, search) {
    if (!countryCode || !search.length || search.length < 3) {
      $scope.places = [];
      return;
    }

    cdCountriesService.listPlaces(countryCode, search, function(places) {
      $scope.places = _.map(places, function(place) {
        return _.omit(place, 'entity$');
      });
    });
  };

  $scope.setCountry = function(dojo, country) {
    dojo.countryName = country.countryName;
    dojo.countryNumber = country.countryNumber;
    dojo.continent = country.continent;
    dojo.alpha2 = country.alpha2;
    dojo.alpha3 = country.alpha3;
  };

  $scope.setPlace = function(dojo, place) {
    dojo.placeName = place.name;
    dojo.placeGeonameId = place.geonameId;
    dojo.county = {};
    dojo.state = {};
    dojo.city = {};
    for (var adminidx=1; adminidx<=4; adminidx++) {
      dojo['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
      dojo['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
    }
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
    if(dojo && dojo.place) {
      var address = dojo.placeName;
      for (var adminidx=4; adminidx >= 1; adminidx--) {
        if (dojo['admin'+adminidx+'Name']) {
          address = address + ', ' + dojo['admin'+adminidx+'Name'];
        }
      }
      address = address + ', ' + dojo['countryName'];
      Geocoder.latLngForAddress(address).then(function (data) {
        $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
        $scope.model.map.panTo($scope.mapOptions.center);
      });
    }
  }

}

angular.module('cpZenPlatform')
  .controller('create-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', cdCreateDojoCtrl]);
