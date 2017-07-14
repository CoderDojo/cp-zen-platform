;(function() {
  'use strict';
  /* global google */

  var ctrller = function ($scope, $uibModal, $timeout) {
    var ctrl = this;
    ctrl.$onInit = function () {
      if (!ctrl.mapOptions) {
        ctrl.mapOptions = {
          center: new google.maps.LatLng(53.344415, -6.260147),
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      }
      ctrl.mapLoaded = true;

      $scope.$watch('$ctrl.model.map', function (map) {
        if (map) {
          $timeout(function () {
            google.maps.event.trigger(ctrl.model.map, 'resize');
          }, 100);
        }
      });

      $scope.$watch('$ctrl.mapOptions', function (map) {
          $timeout(function () {
            ctrl.model.map.panTo(ctrl.mapOptions.center);
          }, 100);
      });
    };
    ctrl.setLoc = function ($event, $params) {
      ctrl.setLocation()($params[0].latLng);
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
    ctrl.open = function () {
      var modalInstance = $uibModal.open({
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        template: '<cd-dojo-map map="$ctrl.map" map-options="$ctrl.mapOptions" ' +
         'model="$ctrl.model" add-marker="$ctrl.addMarker" controls-visible="false">' +
         '</cd-dojo-map>',
        controllerAs: '$ctrl',
        scope: $scope,
        size: 'lg'
      });
    };
  };
angular
    .module('cpZenPlatform')
    .component('cdDojoMap', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/dojo/map',
      bindings : {
        map: '=?',
        mapOptions: '=',
        model: '=?',
        setLocation: '&?',
        addMarker: '=',
        controlsVisible: '<'
      },
      //TODO : dep injection array
      controller: ctrller
    });

}());
