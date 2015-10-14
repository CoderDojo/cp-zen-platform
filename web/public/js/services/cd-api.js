'use strict';

angular.module('cpZenPlatform').service('cdApi', function($http) {
  var baseUrl = 'api/2.0/';
  return {
    post: function(url, params, resolve, reject) {
      $http({
        method: 'POST',
        url: baseUrl + url,
        data: JSON.stringify(params),
        headers: {'Content-Type': 'application/json'}
      }).then(function(result) {
        resolve(result.data);
      }, reject);
    },
    put: function(url, params, resolve, reject) {
      $http({
        method: 'PUT',
        url: baseUrl + url,
        data: JSON.stringify(params),
        headers: {'Content-Type': 'application/json'}
      }).then(function(result) {
        resolve(result.data);
      }, reject);
    },
    get: function(url, resolve, reject) {
      $http({
        method: 'GET',
        url: baseUrl + url,
        headers: {'Content-Type': 'application/json'}
      }).then(function(result) {
        resolve(result.data);
      }, reject);
    },
    delete: function(url, resolve, reject) {
      $http({
        method: 'DELETE',
        url: baseUrl + url,
        headers: {'Content-Type': 'application/json'}
      }).then(function(result) {
        resolve(result.data);
      }, reject);
   }
  };
});
