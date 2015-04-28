'use strict';

function cdDojoDetailCtrl($scope, $window, $stateParams, $location, cdDojoService, alertService, dojo, gmap) {
  $scope.dojo = dojo;
  $scope.model = {};
  $scope.markers = [];

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

}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$window', '$stateParams', '$location', 'cdDojoService', 'alertService', 'dojo', 'gmap', cdDojoDetailCtrl]);
