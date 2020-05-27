'use strict';

angular.module('cpZenPlatform').service('auth', ['$http', '$q', '$window', 'cdApi', function($http, $q, $window, cdApi) {
  var loggedin_user = null;
  function topfail( data ) {
    console.log(data)
  }

  return {

    logout: function(){
      $window.location.href = '/rpi/logout'
    },

    instance: function(win,fail){
      return cdApi.get('users/instance', win, fail, {cache:false});
    },

    cdfInstance: function(win,fail){
      $http({method:'GET', url: '/api/2.0/users/cdf/instance', cache:false}).
        success(win).error(fail||topfail)
    },

    get_loggedin_user: function (win, fail) {
      this.instance(function (data) {
        if (!data.user) {
          return (fail || topfail)('cannot get logged in user');
        }

        loggedin_user = data.user;
        win(loggedin_user);
      });
    },
    get_loggedin_user_promise: function(){
      var deferred = $q.defer();
      this.instance(function (data) {

        loggedin_user = data.user;
        deferred.resolve(loggedin_user);
      });

      return deferred.promise;
    },
    get_cdf_loggedin_user_promise: function(){
      var deferred = $q.defer();
      this.cdfInstance(function (data) {

        loggedin_user = data.user;
        deferred.resolve(loggedin_user);
      });

      return deferred.promise;
    }
  };
}]);
