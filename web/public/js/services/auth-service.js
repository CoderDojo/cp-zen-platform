'use strict';

angular.module('cpZenPlatform').service('auth', function($http, $q) {

  var loggedin_user = null;
  function topfail( data ) {
    console.error(data)
  }

  return {
    login: function(creds,win,fail){
      $http({method:'POST', url: '/auth/login', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    logout: function(win,fail){
      $http({method:'POST', url: '/auth/logout', data:{}, cache:false}).
        success(win).error(fail||topfail)
    },

    instance: function(win,fail){
      $http({method:'GET', url: '/auth/instance', cache:false}).
        success(win).error(fail||topfail)
    },

    register: function(details,win,fail){
      $http({method:'POST', url: '/api/1.0/users/register', data:details, cache:false}).
        success(win).error(fail||topfail)
    },

    reset: function (creds, win, fail) {
      $http({method: 'POST', url: '/api/1.0/users/reset_password', data: creds, cache: false}).
        success(win).error(fail||topfail);
    },  
    
    execute_reset: function(creds,win,fail){
      $http({method:'POST', url: '/api/1.0/users/execute_reset', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    confirm: function(creds,win,fail){
      $http({method:'POST', url: '/auth/confirm', data:creds, cache:false}).
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
