'use strict';

function cdDojoListCtrl($window, $scope, $location, cdDojoService, cdCountriesService, Geocoder, gmap) {
  $scope.model = {};
  $scope.markers = [];
  $scope.continentMarkers = [];
  $scope.stateMarkers = [];
  var countriesLatLongData;
  var continentsLatLongData;
  var countriesContinentsData;
  var dojoCountData;

  cdCountriesService.loadContinentsLatLongData(function(response) {
    continentsLatLongData = response;
  });

  cdCountriesService.loadCountriesLatLongData(function(response) {
    countriesLatLongData = response;
  });

  cdCountriesService.loadCountriesContinents(function(response) {
    countriesContinentsData = response;
  });

  if(gmap) {
    $scope.mapLoaded = true;
    $scope.mapOptions = {
      center: new google.maps.LatLng(53, -7),
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  }
  
  function resetAllMarkers() {
    clearMarkerArrays();
    cdDojoService.dojoCount(function(response) {
      dojoCountData = response;
      var dojosByContinent = response.dojos.continents;
      async.each(Object.keys(dojosByContinent), function(continent, cb) {
        var latitude = continentsLatLongData[continent][0];
        var longitude = continentsLatLongData[continent][1];
        var continentDojoCount = dojosByContinent[continent].total;
        var marker = new google.maps.Marker({
          map:$scope.model.map,
          continent:continent,
          position: new google.maps.LatLng(latitude, longitude),
          icon: 'http://chart.apis.google.com/chart?chst=d_map_spin&chld=1|0|FF0000|14|_|'+continentDojoCount
        });
        $scope.continentMarkers.push(marker);
        cb();
      });
    }); 
  }

  function clearMarkerArrays() {
    if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();
    if($scope.dojos) $scope.dojos = [];
    if($scope.dojoData) $scope.dojoData = [];
    $scope.countryName = '';
    $scope.continentName = '';

    if($scope.continentMarkers) {
      async.each($scope.continentMarkers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function () {
        $scope.continentMarkers = [];
      });
    }

    if($scope.markers) {
      async.each($scope.markers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function() {
        $scope.markers = [];
      });
    }

    if($scope.countryMarkers) {
      async.each($scope.countryMarkers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function() {
        $scope.countryMarkers = [];
      });
    }

    if($scope.stateMarkers) {
      async.each($scope.stateMarkers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function() {
        $scope.stateMarkers = [];
      });
    }
  }

  $scope.$watch('model.map', function(map) {
    if(map) {
      var originalZoom = $scope.model.map.getZoom();
      google.maps.event.addListener($scope.model.map, 'zoom_changed', function() {
        var newZoom = $scope.model.map.getZoom();
        if(newZoom < originalZoom) {
          if(newZoom <= 3) {
            resetAllMarkers();
          }
        }
        originalZoom = newZoom;
      });
      resetAllMarkers();
    }
  });

  $scope.showContinentDojos = function(marker) {
    $scope.countrySelected = false;
    var continentSelected = marker.continent;
    Geocoder.boundsForContinent(continentSelected).then(function (data) {
      $scope.model.map.fitBounds(data);
    });

    var continentCountries = dojoCountData.dojos.continents[continentSelected].countries;
    $scope.continentName = countriesContinentsData.continents[continentSelected];
    cdDojoService.dojosByCountry(continentCountries, function(response) {
      $scope.dojoData = response;
    });
    
    if($scope.continentMarkersHidden && $scope.continentMarkersHidden.length === 1) {
      async.each($scope.markers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function() {
        $scope.markers = [];
        if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();
      
          var markerToShow = _.find($scope.continentMarkers, function(marker) { return marker.continent === $scope.continentMarkersHidden[0].continent });
          markerToShow.setMap($scope.model.map); 
          $scope.continentMarkersHidden.splice(0, 1);

      });
    }
   
    var countData = dojoCountData.dojos.continents[continentSelected].countries;
    async.each(Object.keys(countData), function(country, cb) {
      var countryName = country;
      var countryDojoCount = countData[country].total;
      var latitude = countriesLatLongData[countryName][0];
      var longitude = countriesLatLongData[countryName][1];
      var marker = new google.maps.Marker({
        map:$scope.model.map,
        country:countryName,
        position: new google.maps.LatLng(latitude, longitude),
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + countryDojoCount + '|0066FF|FFFFFF'
      });
      $scope.markers.push(marker);
      cb();
    }); 

    var markerToHide = _.find($scope.continentMarkers, marker, function() { return marker.continent === continentSelected; });
    if(!$scope.continentMarkersHidden) $scope.continentMarkersHidden = [];
    $scope.continentMarkersHidden.push(markerToHide);
    markerToHide.setMap(null);

  }

  $scope.showCountryDojos = function(marker) {
    $scope.countrySelected = true;
    var countrySelected = marker.country;
    Geocoder.boundsForCountry('country:'+countrySelected).then(function (data) {
      $scope.model.map.fitBounds(data);
    });

    // dojo state count:
    cdDojoService.dojosStateCount(countrySelected, function(response) {
      var states = response[countrySelected];
      async.each(Object.keys(states), function(state, cb) {
        if(state === "null") return cb();
        var stateData = states[state];
        var marker = new google.maps.Marker({
          map:$scope.model.map,
          state:state,
          icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + stateData.total + '|009900|000000',
          position: new google.maps.LatLng(stateData.latitude, stateData.longitude)
        });
        $scope.stateMarkers.push(marker);
        cb();
      });
    });

    /*cdDojoService.list({alpha2:countrySelected}, function(response) {
      $scope.countryName = Object.keys(response)[0];
      $scope.dojos = response[$scope.countryName].dojos;

      if(!$scope.countryMarkers) $scope.countryMarkers = [];
      if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();
      async.each($scope.countryMarkers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function () {
        $scope.countryMarkers = [];

        if($scope.markersHidden.length === 2) {
          var markerToShow = _.find($scope.markers, function(marker) { return marker.country === $scope.markersHidden[0].country });
          if(markerToShow) {
            markerToShow.setMap($scope.model.map);  
          }
          $scope.markersHidden.splice(0, 1);
        }
      });

      async.each($scope.dojos, function(dojo, cb) {
        if(dojo.coordinates) {
          var coordinates = dojo.coordinates.split(',');
          var marker = new google.maps.Marker({
            map:$scope.model.map,
            dojo:dojo.name,
            dojoID:dojo.id,
            position: new google.maps.LatLng(coordinates[0], coordinates[1])
          });
          $scope.countryMarkers.push(marker);
        }
        cb();
      }, function() {
        $scope.markerClusterer = new MarkerClusterer($scope.model.map, $scope.countryMarkers);
      });
    });*/

    var markerToHide = _.find($scope.markers, marker, function() { return marker.country === countrySelected; });
    if(!$scope.markersHidden) $scope.markersHidden = [];
    $scope.markersHidden.push(markerToHide);
    markerToHide.setMap(null);
  }

  $scope.showStateMarkers = function(marker) {
    cdDojoService.list({state:{toponymName:marker.state}}, function(response) {
      async.each($scope.stateMarkers, function(marker, cb) {
        marker.setMap(null);
        cb();
      }, function () {
        $scope.stateMarkers = [];

        /*if($scope.markersHidden.length === 2) {
          var markerToShow = _.find($scope.markers, function(marker) { return marker.country === $scope.markersHidden[0].country });
          if(markerToShow) {
            markerToShow.setMap($scope.model.map);  
          }
          $scope.markersHidden.splice(0, 1);
        }*/
      });

      if(!$scope.countryMarkers) $scope.countryMarkers = [];
      $scope.countryName = Object.keys(response)[0];
      $scope.dojos = response[$scope.countryName].dojos;
      if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();

      async.each($scope.dojos, function(dojo, cb) {
        if(dojo.coordinates) {
          var coordinates = dojo.coordinates.split(',');
          var marker = new google.maps.Marker({
            map:$scope.model.map,
            dojo:dojo.name,
            dojoID:dojo.id,
            position: new google.maps.LatLng(coordinates[0], coordinates[1])
          });
          $scope.countryMarkers.push(marker);
        }
        cb();
      }, function() {
        $scope.markerClusterer = new MarkerClusterer($scope.model.map, $scope.countryMarkers);
      });

    });
  }

  $scope.openMarkerInfo = function(marker) {
    if(marker.dojoID) {
      $scope.currentMarker = marker;
      $scope.model.markerInfoWindow.open($scope.model.map, marker);
    }
  }

  $scope.getDojo = function(marker) {
    var dojoID = marker.dojoID;
    cdDojoService.load(dojoID, function(response) {
      $scope.viewDojo(response);
    });
  }

  $scope.viewDojo = function(dojo) {
    cdDojoService.setDojo(dojo, function(response) {
      $location.path('/dojo/' + dojo.id);
    }, function (err){
      if(err){
        alertService.showError(
          'An error has occurred while viewing dojo: <br /> '+
          (err.error || JSON.stringify(err))
        );
      }
    });
  }

  $scope.searchForDojo = function() {
    var dojoName = $scope.search.dojo;
    $scope.countrySelected = true;
    $scope.countryName = '';
    cdDojoService.search({name:dojoName}, {}, function(response) {
      $scope.dojos = response;
    });
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-list-controller', ['$window', '$scope', '$location', 'cdDojoService', 'cdCountriesService', 'Geocoder', 'gmap', cdDojoListCtrl]);