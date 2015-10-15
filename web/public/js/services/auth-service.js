'use strict';

angular.module('cpZenPlatform').service('auth', function($http, $q) {

  var loggedin_user = null;
  function topfail( data ) {
    console.log(data)
  }

  return {
    login: function(creds,win,fail){
      $http({method:'POST', url: '/api/2.0/users/login', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    logout: function(win,fail){
      $http({method:'POST', url: '/api/2.0/users/logout', data:{}, cache:false}).
        success(win).error(fail||topfail)
    },

    instance: function(win,fail){
      $http({method:'GET', url: '/api/2.0/users/instance', cache:false}).
        success(win).error(fail||topfail)
    },

    register: function(details,win,fail){
      $http({method:'POST', url: '/api/2.0/users/register', data:details, cache:false}).
        success(win).error(fail||topfail)
    },

    reset: function (creds, win, fail) {
      $http({method: 'POST', url: '/api/2.0/users/reset-password', data: creds, cache: false}).
        success(win).error(fail||topfail);
    },

    execute_reset: function(creds,win,fail){
      $http({method:'POST', url: '/api/2.0/users/execute-reset', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    confirm: function(creds,win,fail){
      $http({method:'POST', url: 'api/2.0/auth/confirm', data:creds, cache:false}).
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
    }
  };
});
