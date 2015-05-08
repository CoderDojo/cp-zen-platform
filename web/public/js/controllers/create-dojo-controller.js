'use strict';

function cdCreateDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap, auth, $state) {
  $scope.dojo = {};
  $scope.model = {};
  $scope.saveButtonText = 'Create Dojo';

  auth.get_loggedin_user(function(user) {
    $scope.user = user;
  });

 $scope.createDojoUrl = $state.current.url;

  $scope.showCreateDojoForm = function() {
    if($scope.user) {
      //If user has the basic-user role, then this is their first Dojo. 
      //They must first sign up to become a Champion before creating a Dojo.
      var basicUser = _.find($scope.user.roles, function(role) { if(role === 'basic-user') { return true; } });
      var mentorUser = _.find($scope.user.roles, function(role) { if(role === 'mentor') { return true; } });
      if(basicUser || mentorUser) return false;
      return true;
    }
    return false;
  }

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

    var query = {
      query: {
        filtered: {
          query: {
            multi_match: {
              query: search,
              type: "phrase_prefix",
              fields: ['name', 'asciiname', 'alternatenames', 'admin1Name', 'admin2Name', 'admin3Name', 'admin4Name']
            }
          },
          filter: {
            bool: {
              must: [
                {
                  term: {
                    countryCode: countryCode
                  }
                },
                {
                  term: {
                    featureClass: "P"
                  }
                }
              ]
            }
          }
        }
      },
      from: 0,
      size: 100,
      sort: [
        { asciiname: "asc" }
      ]
    };

    cdCountriesService.listPlaces(query).then(function(result) {
      $scope.places = _.map(result.records, function(place) {
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
  .controller('create-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', 'auth', '$state', cdCreateDojoCtrl]);
