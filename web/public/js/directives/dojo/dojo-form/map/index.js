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
      addMarker: '=',
      setLocation: '='
    },
    require: {
      form: '^form'
    },
    controller: function (utilsService, Geocoder, cdDojoService, alertService,
      $translate, $timeout, $scope) {
      var ctrl = this;
      ctrl.$onInit = function () {
        ctrl.places = [];
        ctrl.countries = [];
        ctrl.geoPointSet = false;
        cdDojoService.listCountries(function (countries) {
          ctrl.countries = countries;
        });
      };
      $scope.$watch('$ctrl.ngModel.country', function () {
        if (!_.isUndefined(ctrl.ngModel) && !_.isUndefined(ctrl.ngModel.country)) {
          ctrl.getBoundariesFromCountry();
        }
      });
      // Init manually set marker
      var initMarker2 = $scope.$watchGroup(['$ctrl.ngModel.geoPoint', '$ctrl.mapOptions'], function () {
        if (_.isEmpty(ctrl.model.markers) && !ctrl.geoPointSet) {
          if (!_.isUndefined(ctrl.mapOptions) && !_.isUndefined(ctrl.ngModel) && !_.isUndefined(ctrl.ngModel.geoPoint)) {
            ctrl.setPoint(ctrl.ngModel.geoPoint, 2);
          }
        } else {
          initMarker2();
        }
      }, true);

      ctrl.getPlaces = function ($select) {
        if (ctrl.ngModel.country && ctrl.ngModel.country.alpha2) {
          return utilsService.getPlaces(ctrl.ngModel.country.alpha2, $select).then(function (data) {
            ctrl.places = data;
          }, function (err) {
            ctrl.places = [];
          });
        }
      };

      ctrl.setCountry = function (country) {
        ctrl.ngModel.country = _.pick(country, ['countryName', 'continent', 'alpha2', 'alpha3', 'countryNumber']);
      };

      ctrl.getBoundariesFromCountry = function () {
        Geocoder.boundsForCountry(ctrl.ngModel.country.countryName)
        .then(function (bounds) {
          $timeout(function () {
            ctrl.model.map.fitBounds(bounds);
          });
        });
      };

      ctrl.setLocation = function (latLng) {
        ctrl.ngModel.geoPoint = {
          lat: latLng.lat(),
          lon: latLng.lng()
        };
        ctrl.setPoint(ctrl.ngModel.geoPoint, 15);
      };

      ctrl.setPlace = function (place) {
        ctrl.ngModel.place = _.omit(place, '$$hashKey');
        if (!ctrl.model.markers.length && !_.isUndefined(ctrl.ngModel.place)) {
          ctrl.getLocationFromAddress(10);
        }
      };

      ctrl.setPoint = function (geoPoint, zoom) {
        ctrl.mapOptions.center = new google.maps.LatLng(geoPoint.lat, geoPoint.lon);
        ctrl.mapOptions.zoom = zoom;
        $timeout(function () {
          ctrl.model.map.panTo(ctrl.mapOptions.center);
          ctrl.model.map.setZoom(ctrl.mapOptions.zoom);
        });
        ctrl.addMarker(null, [{latLng: ctrl.mapOptions.center}]);
        ctrl.geoPointSet = true;
      };

      ctrl.getLocationFromAddress = function (zoom) {
        //the extend is a hack for backward compat
        utilsService.getLocationFromAddress(_.cloneDeep(ctrl.ngModel))
        .then(function (data) {
          var match = data[0];
          ctrl.ngModel.geoPoint = {
            lat: match.geometry.location.lat(),
            lon: match.geometry.location.lng()
          };
          // Ensure we don't keep previous's location data when nothing is found
          ctrl.ngModel.state = {};
          ctrl.ngModel.county = {};
          // Set the new county/state
          var state = match.address_components.find(function(addressPart) {
            return addressPart.types.indexOf('administrative_area_level_1') > -1;
          });
          var county = match.address_components.find(function(addressPart) {
            return addressPart.types.indexOf('administrative_area_level_2') > -1;
          });
          if (state) {
            ctrl.ngModel.state = { name: state.short_name };
          }
          if (county) {
            ctrl.ngModel.county = { name: county.short_name };
          }

          ctrl.setPoint(ctrl.ngModel.geoPoint, zoom);
        }, function (err) {
          //Ask user to add location manually if google geocoding can't find location.
          ctrl.geoPointSet = false;
        });
      };
    }
  });
}());
