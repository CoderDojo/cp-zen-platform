'use strict';

function cdDojoListMapCtrl($window, $scope, cdDojoService, cdCountriesService, gmap) {
  $scope.model = {};
  $scope.markers = [];
  var latLongData;
  
  cdCountriesService.loadLatLongData(function(response) {
    latLongData = response;
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
            position: new google.maps.LatLng(latitude, longitude),
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + countryDojoCount + '|FF0000|000000'
          });
          $scope.markers.push(marker);
          cb();
        });
      });
    }
  });
}

angular.module('cpZenPlatform')
  .controller('dojo-list-map-controller', ['$window', '$scope', 'cdDojoService', 'cdCountriesService', 'gmap', cdDojoListMapCtrl]);