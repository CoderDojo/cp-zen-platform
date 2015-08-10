'use strict';
/* global google,jQuery,MarkerClusterer */

function cdDojoListCtrl($window, $state, $stateParams, $scope, $location, cdDojoService, cdCountriesService, AlertBanner, Geocoder, $translate, gmap) {
  $scope.model = {};
  $scope.markers = [];
  $scope.continentMarkers = [];
  $scope.stateMarkers = [];
  $scope.dojoData = [];
  var countriesLatLongData;
  var continentsLatLongData;
  var countriesContinentsData;
  var dojoCountData;
  $scope.currentLevels = [];

  cdDojoService.list({}, function(response) {
    $scope.dojoList = response;
  });
  
  cdCountriesService.loadContinentsLatLongData(function (response) {
    continentsLatLongData = response;
  });

  cdCountriesService.loadCountriesLatLongData(function (response) {
    countriesLatLongData = response;
  });

  cdCountriesService.loadCountriesContinents(function (response) {
    countriesContinentsData = response;
  });

  $scope.currentLevels.push({
    text: 'Earth',
    type: 'earth',
    style: 'active'
  });

  if (gmap) {
    $scope.mapLoaded = true;
    $scope.mapOptions = {
      center: new google.maps.LatLng(25, -5),
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  }

  if ($stateParams.bannerMessage) {
    var type = $stateParams.bannerType || 'info';
    var timeCollapse = $stateParams.bannerTimeCollapse || 5000;
    AlertBanner.publish({
      type: type,
      message: $stateParams.bannerMessage,
      timeCollapse: timeCollapse
    });
  }

  $scope.$on('$viewContentLoaded', function() {
    jQuery('body').cookieDisclaimer({
      text: $translate.instant("By using this website you agree to the use of cookies. You can read about our cookie policy <a href='http://ec.europa.eu/ipg/basics/legal/cookies/index_en.htm#section_2'>here</a>."),
      style: "light", // dark,light
      cssPosition: "relative", //fixed,absolute,relative
      acceptBtn: { text: 'x' },
      policyBtn: { active: false },
      cookie: {
        name: "cookieDisclaimer",
        val: "confirmed",
        path: "/",
        expire: 365
      }
    });
  });

  $scope.resetMap = function (type, text) {
    $scope.originalZoom = $scope.model.map.getZoom();
    $scope.searchResult = null;
    switch (type) {
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
      case 'search':
        removeBreadcrumbs();
        resetAllMarkers();
        break;
    }
  }

  function showCountriesMarkers(continent) {
    clearMarkerArrays();
    var marker = new google.maps.Marker({
      continent: getKeyByValue(countriesContinentsData.continents, continent)
    });
    $scope.showContinentDojos(marker);
  }

  function showStatesMarkers(country) {
    clearMarkerArrays();
    var alpha2Code = getAlpha2CodeForCountry(country);
    var marker = new google.maps.Marker({
      country: alpha2Code
    });
    $scope.showCountryDojos(marker);
  }

  function showMarkersInState(state) {
    clearMarkerArrays();
    var marker = new google.maps.Marker({
      state: state
    });
    $scope.showStateMarkers(marker);
  }

  function resetAllMarkers() {
    clearMarkerArrays();
    cdDojoService.dojoCount(function (response) {
      dojoCountData = response;
      var dojosByContinent = response.dojos.continents;
      _.each(Object.keys(dojosByContinent), function (continent) {
        var latitude = continentsLatLongData[continent][0];
        var longitude = continentsLatLongData[continent][1];
        var continentDojoCount = dojosByContinent[continent].total;
        var marker = new google.maps.Marker({
          map: $scope.model.map,
          continent: continent,
          position: new google.maps.LatLng(latitude, longitude),
          icon: 'http://chart.apis.google.com/chart?chst=d_map_spin&chld=1|0|FF0000|14|_|' + continentDojoCount
        });
        $scope.continentMarkers.push(marker);
        $scope.model.map.setZoom(2);
      });
    });
  }

  function removeBreadcrumbs(minIndex) {
    var levelsToRemove = [];
    for (var i = $scope.currentLevels.length - 1; i >= 0; i--) {
      if (i > minIndex) $scope.currentLevels.splice(i, 1);
    }
  }

  function clearMarkerArrays() {
    if ($scope.markerClusterer) $scope.markerClusterer.clearMarkers();
    if ($scope.dojos) $scope.dojos = [];
    if ($scope.dojoData) $scope.dojoData = [];
    $scope.countryName = '';
    $scope.continentName = '';
    $scope.stateName = '';
    $scope.searchSelected = false;

    if ($scope.continentMarkers) {
      _.each($scope.continentMarkers, function (marker) {
        marker.setMap(null);
      });
      $scope.continentMarkers = [];
    }

    if ($scope.markers) {
      _.each($scope.markers, function (marker) {
        marker.setMap(null);
      });
      $scope.markers = [];
    }

    if ($scope.countryMarkers) {
      _.each($scope.countryMarkers, function (marker) {
        marker.setMap(null);
      });
      $scope.countryMarkers = [];
    }

    if ($scope.stateMarkers) {
      _.each($scope.stateMarkers, function (marker) {
        marker.setMap(null);
      });
      $scope.stateMarkers = [];
    }
  }

  function fillBreadcrumbsSearchBased(dojo) {
    if (dojo.alpha2) {
      var country;
      cdCountriesService.loadCountriesContinents(function (countriesContinents) {
        country = countriesContinents.countries[dojo.alpha2];
        if (country) {
          removeBreadcrumbs(0);
          $scope.currentLevels.push({
            text: countriesContinents.continents[country.continent],
            type: 'continent',
            style: 'active'
          });

          $scope.currentLevels.push({
            text: country.name,
            type: 'country',
            style: 'active'
          });

          if (dojo.admin1_name) {
            $scope.currentLevels.push({
              text: dojo.admin1_name,
              type: 'state',
              style: 'active'
            });
          }
        }
      })
    }
  }

  $scope.$watch('model.map', function (map) {
    if (map) {
      $scope.currentZoom = map.getZoom();
      resetAllMarkers();
    }
  });
  
  window.setTimeout(function(){
    var center = $scope.model.map.getCenter();
    google.maps.event.trigger($scope.model.map, 'resize');
    $scope.model.map.setCenter(center);
  },100);

  $scope.showContinentDojos = function (marker) {
    $scope.countrySelected = false;
    $scope.stateSelected = false;
    var continentSelected = marker.continent;
    Geocoder.boundsForContinent(continentSelected).then(function (data) {
      $scope.model.map.fitBounds(data);
      $scope.model.map.setZoom(3);
      $scope.currentZoom = $scope.model.map.getZoom();
    });

    var continentCountries = dojoCountData.dojos.continents[continentSelected].countries;
    $scope.continentName = countriesContinentsData.continents[continentSelected];
    cdDojoService.dojosByCountry(continentCountries, function (response) {
      $scope.dojoData = response;
    });

    if ($scope.currentLevels.length < 2) {
      _.each($scope.currentLevels, function (currentLevel) {
        currentLevel.style = '';
      })

      $scope.currentLevels.push({
        text: $scope.continentName,
        type: 'continent',
        style: 'active'
      });
    }

    var countData = dojoCountData.dojos.continents[continentSelected].countries;
    _.each(Object.keys(countData), function (country) {
      var countryName = country;
      var countryDojoCount = countData[country].total;
      var latitude = countriesLatLongData[countryName][0];
      var longitude = countriesLatLongData[countryName][1];
      var marker = new google.maps.Marker({
        map: $scope.model.map,
        country: countryName,
        position: new google.maps.LatLng(latitude, longitude),
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + countryDojoCount + '|0066FF|FFFFFF'
      });
      $scope.markers.push(marker);
    });

    _.each($scope.continentMarkers, function (marker) {
      marker.setMap(null);
    });
  }

  $scope.showCountryDojos = function (marker) {
    $scope.countrySelected = true;
    $scope.stateSelected = false;
    var countrySelected = marker.country;

    if(marker.getPosition()) {
      $scope.model.map.setCenter(marker.getPosition());
    }

    $scope.model.map.setZoom(4);
    $scope.currentZoom = $scope.model.map.getZoom();

    cdDojoService.list({alpha2: countrySelected}, function (response) {
      $scope.countryName = Object.keys(response)[0];
      $scope.dojosByCountry = response[$scope.countryName].states;
    });

    cdDojoService.dojosStateCount(countrySelected, function (response) {
      var states = response[countrySelected];
      _.each(Object.keys(states), function (state) {
        if (state !== 'undefined' && state !== 'null' && state !== '') {
          var stateData = states[state];
          var marker = new google.maps.Marker({
            map: $scope.model.map,
            state: state,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + stateData.total + '|009900|000000',
            position: new google.maps.LatLng(stateData.latitude, stateData.longitude)
          });
          $scope.stateMarkers.push(marker);
        }
      });
    });


    if ($scope.currentLevels.length < 3) {
      _.each($scope.currentLevels, function (currentLevel) {
        currentLevel.style = '';
      })

      $scope.currentLevels.push({
        text: countriesContinentsData.countries[countrySelected].name,
        type: 'country',
        style: 'active'
      });
    }

    _.each($scope.markers, function (marker) {
      marker.setMap(null);
    });
  }

  $scope.showStateMarkers = function (marker) {
    $scope.stateSelected = true;
    $scope.countrySelected = false;
    $scope.stateName = marker.state;

    cdDojoService.list({admin1Name: marker.state}, function (response) {

      _.each($scope.stateMarkers, function (marker) {
        marker.setMap(null);
      });

      if (!$scope.countryMarkers) $scope.countryMarkers = [];
      $scope.countryName = Object.keys(response)[0];
      $scope.dojos = response[$scope.countryName].states[$scope.stateName];
      if ($scope.markerClusterer) $scope.markerClusterer.clearMarkers();

      _.each($scope.dojos, function (dojo) {
        if (dojo.coordinates) {
          var coordinates = dojo.coordinates.split(',');
          var pinColor = dojo.private === 1 ? 'FF0000' : '008000';
          var marker = new google.maps.Marker({
            map: $scope.model.map,
            dojo: dojo.name,
            dojoID: dojo.id,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
            position: new google.maps.LatLng(coordinates[0], coordinates[1])
          });
          $scope.countryMarkers.push(marker);
        }
      });

      if ($scope.currentLevels.length < 4) {
        _.each($scope.currentLevels, function (currentLevel) {
          currentLevel.style = '';
        })

        $scope.currentLevels.push({
          text: $scope.stateName,
          type: 'state',
          style: 'active'
        });
      }

      $scope.markerClusterer = new MarkerClusterer($scope.model.map, $scope.countryMarkers);
      var coords = _.map($scope.dojos, function (dojo) {
        var pair = dojo.coordinates.split(',');
        return {lat: parseFloat(pair[0]), lng: parseFloat(pair[1])};
      });

      var minlat = _.chain(coords).pluck('lat').min();
      var maxlat = _.chain(coords).pluck('lat').max();
      var minlng = _.chain(coords).pluck('lng').min();
      var maxlng = _.chain(coords).pluck('lng').max();
      var minCoords = new google.maps.LatLng(minlat, minlng);
      var maxCoords = new google.maps.LatLng(maxlat, maxlng);

      Geocoder.boundsMinMax(minCoords, maxCoords).then(function (data) {
        $scope.model.map.fitBounds(data);
        $scope.model.map.setZoom(8);
        $scope.currentZoom = $scope.model.map.getZoom();
      });
    });
  }

  $scope.openMarkerInfo = function (marker) {
    if (marker.dojoID) {
      $scope.currentMarker = marker;
      $scope.model.markerInfoWindow.open($scope.model.map, marker);
    }
  }

  $scope.getDojo = function (marker) {
    var dojoID = marker.dojoID;
    cdDojoService.load(dojoID, function (response) {
      $scope.viewDojo(response);
    });
  }

  $scope.viewDojo = function(dojo) {
    var urlSlug = dojo.url_slug || dojo.urlSlug;
    var urlSlugArray = urlSlug.split('/');
    var country = urlSlugArray[0].toString();
    urlSlugArray.splice(0, 1);
    var path = urlSlugArray.join('/');
    $state.go('dojo-detail',{country:country, path:path});
  }

  function getKeyByValue(obj, value) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (obj[prop] === value) return prop;
      }
    }
  }

  function getAlpha2CodeForCountry(country) {
    for (var prop in countriesContinentsData.countries) {
      if (countriesContinentsData.countries[prop].name === country) {
        return prop;
      }
    }
  }

  function addMarkersToMap(dojos) {
    $scope.countryMarkers = [];

    if ($scope.markerClusterer) $scope.markerClusterer.clearMarkers();

    _.each(dojos, function (dojo) {
      if (dojo.coordinates) {
        var coordinates = dojo.coordinates.split(',');
        var pinColor = dojo.private === 1 ? 'FF0000' : '008000';
        var marker = new google.maps.Marker({
          map: $scope.model.map,
          dojo: dojo.name,
          dojoID: dojo.id,
          icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
          position: new google.maps.LatLng(coordinates[0], coordinates[1])
        });
        $scope.countryMarkers.push(marker);
      }
    });

    $scope.markerClusterer = new MarkerClusterer($scope.model.map, $scope.countryMarkers);
    $scope.currentZoom = $scope.model.map.getZoom();
  }

  $scope.search = function () {
    if (!$scope.search.dojo) {
      return;
    }

    clearMarkerArrays();
    $scope.searchResult = null;
    $scope.currentLevels = _.reject($scope.currentLevels, function (level) {
      return level.type === 'search'
    });

    var address = $scope.search.dojo;
    Geocoder.geocode(address).then(function (results) {
      if (!results.length) {
        return;
      }

      $scope.search.dojo = '';

      var location = results[0].geometry.location;

      if (results[0].geometry.bounds) {
        var bounds = results[0].geometry.bounds;
        $scope.model.map.fitBounds(bounds);
        $scope.searchBounds(location, $scope.model.map.getBounds(), true);
      } else {
        $scope.searchNearest(location);
      }
    }, function (reason) {
      console.error(reason);
    });
  }

  $scope.searchNearest = function (location) {
    cdDojoService.searchNearestDojos({lat: location.lat(), lon: location.lng()}).then(function (result) {
      clearMarkerArrays();
      $scope.searchResult = result;
      addMarkersToMap(result);
      if (result.length) {
        var closest = result[0];
        $scope.searchBounds(location, $scope.model.map.getBounds());
      }
    });
  }

  $scope.searchBounds = function (location, bounds, fallbackToNearest) {
    var boundsRadius = getBoundsRadius(bounds);
    cdDojoService.searchBoundingBox({lat: location.lat(), lon: location.lng(), radius: boundsRadius}).then(function (result) {
      if (result.length > 0) {
        clearMarkerArrays();
        $scope.searchResult = result;
        addMarkersToMap(result);
        fillBreadcrumbsSearchBased(result[0]);
      }
      else {
        if (fallbackToNearest) {
          $scope.searchNearest(location);
        }
      }
    });
  }

  $scope.mapDragEnd = function () {
    if ($scope.searchResult) {
      $scope.searchBounds($scope.model.map.getCenter(), $scope.model.map.getBounds());
    }
  }

  $scope.mapZoomChanged = function () {
    // A minimum zoom level of 2 - don't let map zoom out farther than the world.
    if ($scope.model.map.getZoom() < $scope.currentZoom) {
      if ($scope.model.map.getZoom() < 2) {
        $scope.model.map.setZoom(2);
        $scope.resetMap('earth');
      }

      if ($scope.model.map.getZoom() === 3 && $scope.currentLevels.length > 2) {
        $scope.resetMap('continent', $scope.currentLevels[1].text);
        $scope.model.map.setZoom(3);
      }

      if ($scope.model.map.getZoom() === 4 && $scope.currentLevels.length > 3) {
        $scope.resetMap('country', $scope.currentLevels[2].text);
        $scope.model.map.setZoom(4);
      }

      if ($scope.model.map.getZoom() === 8) {
        $scope.currentZoom = 8;
        $scope.resetMap('state', $scope.currentLevels[3].text);
        $scope.model.map.setZoom(8);
      }

      if ($scope.searchResult && $scope.model.map.getZoom() > 2) {
        $scope.searchBounds($scope.model.map.getCenter(), $scope.model.map.getBounds());
      }
    }
  }

  function getBoundsRadius(bounds) {
    var center = bounds.getCenter();
    var northEast = bounds.getNorthEast();
    var earthRadius = 3963.0;  
    var lat1 = center.lat() / 57.2958; 
    var lon1 = center.lng() / 57.2958;
    var lat2 = northEast.lat() / 57.2958;
    var lon2 = northEast.lng() / 57.2958;
    var distanceInMiles = earthRadius * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    return distanceInMiles * 1609.34 //convert to meters
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-list-controller', ['$window', '$state', '$stateParams', '$scope', '$location', 'cdDojoService', 'cdCountriesService', 'AlertBanner', 'Geocoder', '$translate', 'gmap', cdDojoListCtrl]);
