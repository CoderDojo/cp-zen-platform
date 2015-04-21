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
  $scope.currentLevels = [];
  //test
  cdCountriesService.loadContinentsLatLongData(function(response) {
    continentsLatLongData = response;
  });

  cdCountriesService.loadCountriesLatLongData(function(response) {
    countriesLatLongData = response;
  });

  cdCountriesService.loadCountriesContinents(function(response) {
    countriesContinentsData = response;
  });

  $scope.currentLevels.push({
    text:'Earth',
    type:'earth',
    style:'active'
  });

  if(gmap) {
    $scope.mapLoaded = true;
    $scope.mapOptions = {
      center: new google.maps.LatLng(53, -7),
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  }

  $scope.resetMap = function(type, text) {
    switch(type) {
      case 'earth': 
        removeBreadcrumbs(0);
        resetAllMarkers();
        break;
      case 'continent':
        removeBreadcrumbs(1);
        showCountriesMarkers(text);
        break;
      case 'country':
        removeBreadcrumbs(2);
        showStatesMarkers(text);
        break;
      case 'state':
        removeBreadcrumbs(3);
        showMarkersInState(text);
        break;
    }
  }

  function showCountriesMarkers(continent) {
    clearMarkerArrays();
    var marker = new google.maps.Marker({
      continent:getKeyByValue(countriesContinentsData.continents, continent)
    });
    $scope.showContinentDojos(marker);
  }

  function showStatesMarkers(country) {
    clearMarkerArrays();
    var alpha2Code = getAlpha2CodeForCountry(country);
    var marker = new google.maps.Marker({
      country:alpha2Code
    });
    $scope.showCountryDojos(marker);
  }

  function showMarkersInState(state) {
    clearMarkerArrays();
    var marker = new google.maps.Marker({
      state:state
    });
    $scope.showStateMarkers(marker);
  }
  
  function resetAllMarkers() {
    clearMarkerArrays();
    cdDojoService.dojoCount(function(response) {
      dojoCountData = response;
      var dojosByContinent = response.dojos.continents;
      _.each(Object.keys(dojosByContinent), function(continent) {
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
        $scope.model.map.setZoom(2);
      });
    }); 
  }

  function removeBreadcrumbs(minIndex) {
    var levelsToRemove = [];
    for(var i = $scope.currentLevels.length-1; i >= 0; i--) {
      if(i > minIndex) $scope.currentLevels.splice(i, 1);
    }
  }

  function clearMarkerArrays() {
    if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();
    if($scope.dojos) $scope.dojos = [];
    if($scope.dojoData) $scope.dojoData = [];
    $scope.countryName = '';
    $scope.continentName = '';
    $scope.searchSelected = false;

    if($scope.continentMarkers) {
      _.each($scope.continentMarkers, function(marker) {
        marker.setMap(null);
      });
      $scope.continentMarkers = [];
    }

    if($scope.markers) {
      _.each($scope.markers, function(marker) {
        marker.setMap(null);
      });
      $scope.markers = [];
    }

    if($scope.countryMarkers) {
      _.each($scope.countryMarkers, function(marker) {
        marker.setMap(null);
      });
      $scope.countryMarkers = [];
    }

    if($scope.stateMarkers) {
      _.each($scope.stateMarkers, function(marker) {
        marker.setMap(null);
      });
      $scope.stateMarkers = [];
    }
  }

  $scope.$watch('model.map', function(map) {
    if(map) {
      resetAllMarkers();
    }
  });

  $scope.showContinentDojos = function(marker) {
    $scope.countrySelected = false;
    $scope.stateSelected = false;
    var continentSelected = marker.continent;
    Geocoder.boundsForContinent(continentSelected).then(function (data) {
      $scope.model.map.fitBounds(data);
    });

    var continentCountries = dojoCountData.dojos.continents[continentSelected].countries;
    $scope.continentName = countriesContinentsData.continents[continentSelected];
    cdDojoService.dojosByCountry(continentCountries, function(response) {
      $scope.dojoData = response;
    });

    if($scope.currentLevels.length < 2) {
      _.each($scope.currentLevels, function(currentLevel) {
        currentLevel.style = '';
      })

      $scope.currentLevels.push({
        text:$scope.continentName,
        type:'continent',
        style:'active'
      });
    }
   
    var countData = dojoCountData.dojos.continents[continentSelected].countries;
    _.each(Object.keys(countData), function(country) {
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
    }); 

    _.each($scope.continentMarkers, function(marker) {
      marker.setMap(null);
    });

  }

  $scope.showCountryDojos = function(marker) {
    $scope.countrySelected = true;
    $scope.stateSelected = false;
    var countrySelected = marker.country;
    Geocoder.boundsForCountry('country:'+countrySelected).then(function (data) {
      $scope.model.map.fitBounds(data);
    });

    cdDojoService.list({alpha2:countrySelected}, function(response) {
      $scope.countryName = Object.keys(response)[0];
      $scope.dojosByCountry = response[$scope.countryName].states;
    });

    cdDojoService.dojosStateCount(countrySelected, function(response) {
      var states = response[countrySelected];
      _.each(Object.keys(states), function(state) {
        if(state !== 'undefined' && state !== 'null' && state !== '') {
          var stateData = states[state];
          var marker = new google.maps.Marker({
            map:$scope.model.map,
            state:state,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + stateData.total + '|009900|000000',
            position: new google.maps.LatLng(stateData.latitude, stateData.longitude)
          });
          $scope.stateMarkers.push(marker);
        }
      });
    });

   
   if($scope.currentLevels.length < 3) {
      _.each($scope.currentLevels, function(currentLevel) {
        currentLevel.style = '';
      })

      $scope.currentLevels.push({
        text:countriesContinentsData.countries[countrySelected].name,
        type:'country',
        style:'active'
      });
    }

    _.each($scope.markers, function(marker) {
      marker.setMap(null);
    });

  }

  $scope.showStateMarkers = function(marker) {
    $scope.stateSelected = true;
    $scope.countrySelected = false;
    $scope.stateName = marker.state;

    cdDojoService.list({admin1Name:marker.state}, function(response) {
      
      _.each($scope.stateMarkers, function(marker) {
        marker.setMap(null);
      });

      if(!$scope.countryMarkers) $scope.countryMarkers = [];
      $scope.countryName = Object.keys(response)[0];
      $scope.dojos = response[$scope.countryName].states[$scope.stateName];
      if($scope.markerClusterer) $scope.markerClusterer.clearMarkers();

      _.each($scope.dojos, function(dojo) {
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
      });

      if($scope.currentLevels.length < 4) {
        _.each($scope.currentLevels, function(currentLevel) {
          currentLevel.style = '';
        })

        $scope.currentLevels.push({
          text:$scope.stateName,
          type:'state',
          style:'active'
        });
      }

      $scope.markerClusterer = new MarkerClusterer($scope.model.map, $scope.countryMarkers);
      var coords = _.map($scope.dojos, function(dojo) { 
        var pair = dojo.coordinates.split(',');
        return { lat: parseFloat(pair[0]), lng: parseFloat(pair[1]) }; 
      });

      var minlat = _.chain(coords).pluck('lat').min();
      var maxlat = _.chain(coords).pluck('lat').max();
      var minlng = _.chain(coords).pluck('lng').min();
      var maxlng = _.chain(coords).pluck('lng').max();
      var minCoords = new google.maps.LatLng(minlat, minlng);
      var maxCoords = new google.maps.LatLng(maxlat, maxlng);

      Geocoder.boundsMinMax(minCoords, maxCoords).then(function (data) {
        $scope.model.map.fitBounds(data);
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
    $scope.searchSelected = true;
    $scope.countrySelected = false;
    $scope.stateSelected = false;
    $scope.countryName = '';
    cdDojoService.search({name:dojoName}, {}, function(response) {
      $scope.dojos = response;
    });
  }

  function getKeyByValue(obj, value) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        if(obj[prop] === value) return prop;
      }
    }
  }

  function getAlpha2CodeForCountry(country) {
    for(var prop in countriesContinentsData.countries) {
      if(countriesContinentsData.countries[prop].name === country) {
        return prop;
      } 
    }
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-list-controller', ['$window', '$scope', '$location', 'cdDojoService', 'cdCountriesService', 'Geocoder', 'gmap', cdDojoListCtrl]);