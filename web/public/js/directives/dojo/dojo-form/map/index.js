;(function() {
  'use strict';
  /* global google */
angular
  .module('cpZenPlatform')
  .component('cdDojoFormMap', {
    restrict: 'EA',
    templateUrl: '/directives/tpl/dojo/dojo-form/map',
    bindings: {
      ngModel: '=',
      mapOptions: '=',
      model: '=',
      addMarker: '='
    },
    controller: function (utilsService, Geocoder, cdDojoService, alertService, $translate) {
      var ctrl = this;
      ctrl.$onInit = function () {
        ctrl.places = [];
        ctrl.countries = [];
        cdDojoService.listCountries(function (countries) {
          ctrl.countries = countries;
        });
      };

      ctrl.getPlaces = function ($select) {
        if (ctrl.ngModel && ctrl.ngModel.alpha2) {
          return utilsService.getPlaces(ctrl.ngModel.alpha2, $select).then(function (data) {
            ctrl.places = data;
          }, function (err) {
            ctrl.places = [];
          });
        }
      };

      ctrl.setCountry = function (country) {
        _.extend(ctrl.ngModel, _.pick(country, ['countryName', 'countryNumber', 'continent', 'alpha2', 'alpha3']));
        if (!ctrl.model.markers.length) ctrl.getBoundariesFromCountry();
      };

      ctrl.getBoundariesFromCountry = function () {
        Geocoder.boundsForCountry(ctrl.ngModel.countryName)
        .then(function (bounds) {
          setTimeout(function () {
            ctrl.model.map.fitBounds(bounds);
          });
        });
      };

      ctrl.setPlace = function (place) {
        _.extend(ctrl.ngModel, place);
        if (!ctrl.model.markers.length) ctrl.getLocationFromAddress();
      };

      ctrl.getLocationFromAddress = function () {
        //the extend is a hack for backward compat
        utilsService.getLocationFromAddress(_.extend(ctrl, ctrl.ngModel)).then(function (data) {
          ctrl.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
          ctrl.ngModel.coordinates = data.lat + ', ' + data.lng;
          ctrl.ngModel.geoPoint = {
            lat: data.lat,
            lon: data.lng
          };
          setTimeout(function () {
            ctrl.model.map.panTo(ctrl.mapOptions.center);
          });
          ctrl.addMarker(null, [{latLng: ctrl.mapOptions.center}]);
        }, function (err) {
          //Ask user to add location manually if google geocoding can't find location.
          alertService.showError($translate.instant('Please add your location manually by clicking on the map.'));
        });
      };
    }
  });
}());
