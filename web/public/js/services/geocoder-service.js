/*global angular: true, google: true, _ : true */

'use strict';

angular.module('cpZenPlatform').factory('Geocoder', function ($localStorage, $q, $timeout) {
  var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

  var queue = [];

  var continentBounds = {"AF":["-4.699616","1.582031", "29.912091", "33.398438"],
                         "AN":["-84.499924","-20.742187", "-67.443336", "97.382813"],
                         "AS":["18.832216", "44.033203", "39.671256", "140.800781"],
                         "EU":["40.320896", "-3.735352", "52.193719", "19.335938"],
                         "NA":["26.625363", "-113.203125", "50.74949", "-68.203125"],
                         "OC":["-45.922498", "99.667969", "-12.170911", "171.035156"],
                         "SA":["-34.852129", "-66.09375", "-4.194399", "-40.341797"]
                        };
  // Amount of time (in milliseconds) to pause between each trip to the
  // Geocoding API, which places limits on frequency.
  var queryPause = 250;

  /**
   * executeNext() - execute the next function in the queue.
   *                  If a result is returned, fulfill the promise.
   *                  If we get an error, reject the promise (with message).
   *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
   */
  var executeNext = function () {
    var task = queue[0],
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address : task.address }, function (result, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        var latLng = {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng()
        };

        queue.shift();

        locations[task.address] = latLng;
        $localStorage.locations = JSON.stringify(locations);

        task.d.resolve(latLng);

        if (queue.length) {
          $timeout(executeNext, queryPause);
        }
      } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        queue.shift();
        task.d.reject({
          type: 'zero',
          message: 'Zero results for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        queryPause += 250;
        $timeout(executeNext, queryPause);
      } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        queue.shift();
        task.d.reject({
          type: 'denied',
          message: 'Request denied for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.INVALID_REQUEST) {
        queue.shift();
        task.d.reject({
          type: 'invalid',
          message: 'Invalid request for geocoding address ' + task.address
        });
      }
    });
  };

  return {
    latLngForAddress : function (address) {
      var d = $q.defer();

      if (_.has(locations, address)) {
        $timeout(function () {
          d.resolve(locations[address]);
        });
      } else {
        queue.push({
          address: address,
          d: d
        });

        if (queue.length === 1) {
          executeNext();
        }
      }

      return d.promise;
    },
    boundsForCountry: function(country) {
      var d = $q.defer();
      var geocoder = new google.maps.Geocoder();

      geocoder.geocode({address:country}, function (results, status) {
        if(status === google.maps.GeocoderStatus.OK) {
          var resultBounds = new google.maps.LatLngBounds(
            results[0].geometry.viewport.getSouthWest(),
            results[0].geometry.viewport.getNorthEast()
          );
          d.resolve(resultBounds);
        } else {
          d.reject({
            type: 'error',
            message: 'Error getting bounds for ' + country
          });
        }
      });
      return d.promise;
    },
    boundsForContinent: function(continent) {
      var d = $q.defer();
      var southWestCoordinates = new google.maps.LatLng(continentBounds[continent][0], continentBounds[continent][1]);
      var northEastCoordinates = new google.maps.LatLng(continentBounds[continent][2], continentBounds[continent][3]);
      var resultBounds  = new google.maps.LatLngBounds(
        southWestCoordinates,
        northEastCoordinates
      );
      d.resolve(resultBounds);
      return d.promise;
    },
    boundsMinMax: function(min, max) {
      var d = $q.defer();
      var resultBounds  = new google.maps.LatLngBounds(
        min,
        max
      );
      d.resolve(resultBounds);
      return d.promise;
    },
    geocode: function(address) {
      var d = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({address:address}, function (results, status) {
        if(status === google.maps.GeocoderStatus.OK) {
          d.resolve(results);
        } else {
          d.reject({
            type: 'error',
            message: 'Error getting bounds for ' + address
          });
        }
      });
      return d.promise
    }
  };
});
