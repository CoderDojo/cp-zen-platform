'use strict';

function cdDojoListMapCtrl($window, $scope, cdDojoService, Geocoder, gmap) {
  $scope.model = {};
  $scope.markers = [];

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
        var latLngData = [];
        async.eachSeries(response, function(country, cb) {
          var countryName = Object.keys(country);
          countryName = countryName[0];
          var countryDojoCount = country[countryName];
          Geocoder.latLngForAddress(countryName).then(function (data) {
            latLngData.push({name:countryName, count:countryDojoCount, lat:data.lat, lng:data.lng});
            cb();
          }).catch(function(error) {
            console.log('Error occurred!', error);
            return cb(error);
          });
        }, function() {
          console.log("latLngData " + JSON.stringify(latLngData));
          async.eachSeries(latLngData, function(location, cb) {
            var marker = new google.maps.Marker({
              map: $scope.model.map,
              position: new google.maps.LatLng(location.lat, location.lng),
              icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + location.count + '|FF0000|000000'
            });
            $scope.markers.push(marker);
            cb();
          });
        });
      });
    }
  });
}

angular.module('cpZenPlatform')
  .controller('dojo-list-map-controller', ['$window', '$scope', 'cdDojoService', 'Geocoder', 'gmap', cdDojoListMapCtrl]);