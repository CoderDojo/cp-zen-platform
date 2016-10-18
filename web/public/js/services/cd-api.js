'use strict';

angular.module('cpZenPlatform').service('cdApi', ['$http', function($http) {
  var baseUrl = '/api/2.0/';
  return {
    baseUrl: baseUrl,
    post: function(url, params, resolve, reject) {
      return wrapCbPromise(function(){
        return $http({
          method: 'POST',
          url: baseUrl + url,
          data: JSON.stringify(params),
          headers: {'Content-Type': 'application/json'}
        });
      }, resolve, reject)
    },
    put: function(url, params, resolve, reject) {
      return wrapCbPromise(function(){
        return $http({
          method: 'PUT',
          url: baseUrl + url,
          data: JSON.stringify(params),
          headers: {'Content-Type': 'application/json'}
        });
      }, resolve, reject);
    },
    get: function(url, resolve, reject) {
      return wrapCbPromise(function(){
        return $http({
          method: 'GET',
          url: baseUrl + url,
          headers: {'Content-Type': 'application/json'}
        });
      }, resolve, reject);
    },
    delete: function(url, resolve, reject) {
      return wrapCbPromise(function(){
        return $http({
          method: 'DELETE',
          url: baseUrl + url,
          headers: {'Content-Type': 'application/json'}
        })
      }, resolve, reject);
   }
  };

  function wrapCbPromise (fn, resolve, reject) {
    if (resolve) {
      fn()
      .then(function (response) {
        var data = response.data && response.headers && response.config? response.data: response;
        return resolve(data);
      }, reject);
    } else {
      return fn();
    }
  }
}]);
