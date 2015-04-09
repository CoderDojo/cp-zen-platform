'use strict';

function cdDojoListMapCtrl($window, $scope, $location, cdDojoService, cdCountriesService, Geocoder, gmap) {
  $scope.model = {};
  $scope.markers = [];
  var latLongData;
  
  cdCountriesService.loadLatLongData(function(response) {
    latLongData = response;
  });

  cdDojoService.list({alpha2:"IE"}, function(response) {
    $scope.countryName = Object.keys(response)[0];
    $scope.dojos = response[$scope.countryName].dojos;
  });

  Geocoder.boundsForCountry('country:IE').then(function (data) {
    $scope.model.map.fitBounds(data);
  });

  if(gmap) {
    $scope.mapLoaded = true;
    $scope.mapOptions = {
      center: new google.maps.LatLng(53, -7),
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  }

  $scope.$watch('model.map', function(map){
    if(map) {
      cdDojoService.dojosCountryCount(function(response) {
        async.each(response, function(country, cb) {
          var countryName = Object.keys(country);
          countryName = countryName[0];
          var countryDojoCount = country[countryName];
          var latitude = latLongData[countryName][0];
          var longitude = latLongData[countryName][1];
          var marker = new google.maps.Marker({
            map:$scope.model.map,
            country:countryName,
            position: new google.maps.LatLng(latitude, longitude),
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + countryDojoCount + '|FF0000|000000'
          });
          $scope.markers.push(marker);
          cb();
        });
      });
    }
  });

  $scope.showCountryDojos = function(marker) {
    var countrySelected = marker.country;
    Geocoder.boundsForCountry('country:'+countrySelected).then(function (data) {
      $scope.model.map.fitBounds(data);
    });

    cdDojoService.list({alpha2:countrySelected}, function(response) {
      $scope.countryName = Object.keys(response)[0];
      $scope.dojos = response[$scope.countryName].dojos;
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

}

angular.module('cpZenPlatform')
  .controller('dojo-list-map-controller', ['$window', '$scope', '$location', 'cdDojoService', 'cdCountriesService', 'Geocoder', 'gmap', cdDojoListMapCtrl]);