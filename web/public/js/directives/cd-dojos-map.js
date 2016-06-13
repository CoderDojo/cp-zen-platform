;(function() {
  'use strict';
  /*global google, StyledMarker, StyledIcon, StyledIconTypes */

function cdDojosMap($stateParams, cdDojoService, $state) {
    return {
      restrict: 'E',
      template: '<div class="dojo-map row">'+
        '<section ng-if="mapLoaded" id="map">'+
        '<div ui-map-info-window="model.markerInfoWindow">'+
          '<h3><a class="pointer" ng-click="getDojo(currentMarker)">{{ currentMarker.dojoName }}</a></h3>'+
        '</div>'+
        '<div ng-repeat="marker in markers" ui-map-marker="markers[$index]" ui-event="{\'map-click\': \'openMarkerInfo(marker)\'}"></div>'+
        '<div id="googleMap" ui-map="model.map" ui-event="{\'map-dragend\':\'mapDragEnd()\', \'map-zoom_changed\':\'mapZoomChanged()\'}" ui-options="mapOptions" class="map-canvas"></div>'+
      '</section></div>',
      controller: function($scope){
        $scope.markers = [];
        $scope.model = {};
        if($scope.gmap){
          var position = new google.maps.LatLng($stateParams.lat, $stateParams.lon);
          var zoom = parseInt($stateParams.zoom);
          $scope.mapLoaded = true;
          $scope.mapOptions = {
            center: position,
            zoom: zoom || 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          cdDojoService.list({verified: 1, deleted: 0, fields$:['name', 'geo_point', 'stage']}, function (dojos) {
            var filteredDojos = [];
            _.each(dojos, function (dojo) {
              if(dojo.stage !== 4){
                if (dojo.geoPoint || dojo.geo_point) {
                  var pinColor = dojo.private === 1 ? 'FF0000' : '008000';
                  var marker = new google.maps.Marker({
                    map: $scope.model.map,
                    dojoName: dojo.name,
                    dojoId: dojo.id,
                    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
                    position: new google.maps.LatLng(dojo.geoPoint && dojo.geoPoint.lat || dojo.geo_point.lat, dojo.geoPoint && dojo.geoPoint.lon || dojo.geo_point.lon)
                  });
                  marker.dojo = dojo;
                  $scope.markers.push(marker);
                }
              }
            });
          });
          $scope.openMarkerInfo = function(marker) {
            if (marker.dojoId) {
              $scope.currentMarker = marker;
              $scope.model.markerInfoWindow.open($scope.model.map, marker);
            }
          };
          $scope.viewDojo = function(dojo) {
            var urlSlug = dojo.url_slug || dojo.urlSlug;
            var urlSlugArray = urlSlug.split('/');
            var country = urlSlugArray[0].toString();
            urlSlugArray.splice(0, 1);
            var path = urlSlugArray.join('/');
            $state.go('dojo-detail', {country:country, path:path });
          }
          $scope.getDojo = function (marker) {
            var dojoId = marker.dojoId;
            cdDojoService.load(dojoId, function (response) {
              $scope.viewDojo(response);
            });
          };
        }
      },
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdDojosMap', ['$stateParams', 'cdDojoService', '$state', cdDojosMap]);

}());
