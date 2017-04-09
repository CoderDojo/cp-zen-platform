;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdDojoMap', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/map',
      bindings : {
        map: '=?',
        mapOptions: '=',
        model: '=?',
        addMarker: '='
      },
      //TODO : dep injection array
      controller: function ($scope) {
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.mapLoaded = true;
          if (!ctrl.mapOptions) {
            ctrl.mapOptions = {
              center: new google.maps.LatLng(53.344415, -6.260147),
              zoom: 5,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
          }

          $scope.$watch('$ctrl.model.map', function (map) {
            if (map) {
              setTimeout(function () {
                google.maps.event.trigger(ctrl.model.map, 'resize');
              }, 100);
            }
          });

          $scope.$watch('$ctrl.mapOptions', function (map) {
              setTimeout(function () {
                ctrl.model.map.panTo(ctrl.mapOptions.center);
              }, 100);
          });
        };

        ctrl.addMarker = function ($event, $params) {
          angular.forEach(ctrl.model.markers, function (marker) {
            marker.setMap(null);
          });
          var marker = new google.maps.Marker({
            map: ctrl.model.map,
            position: $params[0].latLng
          });
          marker.addListener('click', function () {
            angular.forEach(ctrl.model.markers, function (marker) {
              marker.setMap(null);
            });
          });
          ctrl.model.markers.push(marker);
        };
      }
    });
}());
