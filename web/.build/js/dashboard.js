(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function headerCtrl($window, $scope) {
  $scope.navigateTo = function (page) {
    $window.location.href = '/' + page;
  };
}

angular.module('cpZenPlatform')
  .controller('header', ['$window', '$scope', headerCtrl]);

},{}],2:[function(require,module,exports){
'use strict';

angular.module('cpZenPlatform').controller('login', function($scope, $location, $window, auth){

  var msgmap = {
    'unknown': 'Unable to perform your request at this time - please try again later.',
    'user-not-found': 'Email address is not recognized.',
    'invalid-password': 'That password is incorrect',
    'reset-sent': 'An email with password reset instructions has been sent to you.'
  }

  var path = window.location.pathname


  $scope.login = {}
  $scope.forgot = {}


  $scope.isVisible = function(view) {
    return $scope.currentView === view
  }

  $scope.show = function(view) {
    $scope.message = ''
    $scope.errorMessage = ''

    $scope.currentView = view
  }

  $scope.doLogin = function() {
    $scope.message = ''
    $scope.errorMessage = ''

    if (!$scope.loginForm.$valid) {
      return
    }

    auth.login($scope.login,
      function(data){
        $window.location.href = '/dashboard';
      },
      function(){
        $scope.errorMessage = 'Invalid email or password!'
      }
    )
  }

  $scope.sendPasswordResetEmail = function() {
    $scope.message = ''
    $scope.errorMessage = ''

    if (!$scope.forgotPasswordForm.$valid) {
      return
    }

    auth.reset({
      email:$scope.forgot.email
    }, function() {
      $scope.message = msgmap['reset-sent'];
    }, function(out) {
      $scope.errorMessage = msgmap[out.why] || msgmap.unknown
    })
  }

  $scope.logout = function(){
    auth.logout(function(data){
      $window.location.href = '/'
    })
  }

  $scope.goHome = function() {
    window.location.href = '/'
  }


  auth.instance(function(data){
    if( data.user ) {
      $scope.user = data.user;
      if (path==='/') {
        $window.location.href = 'dashboard'
      }
    }
    else {
      $scope.show('login')
    }
  })


  /*
  function show_login() {
    $scope.show_account = false
    $scope.show_login   = true
  }

  function show_user( user ) {
    $scope.show_account = true
    $scope.show_login   = false
    $scope.name = user.name

    if( user.roles && 1 < user.roles.length ) {
      $scope.show_roles = true
      $scope.roles = []

      var homemap = {
        student: 'learn',
        teacher: 'teach',
        manager: 'manage'
      }

      _.each(user.roles,function(role){
        $scope.roles.push({
          name:role,
          home:homemap[role]
        })
      })
    }

    console.log(user,$scope.name)
  }
  */
})

},{}],3:[function(require,module,exports){
'use strict';

var app = angular.module('cpZenPlatform', [
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  //'angularMoment'
  //'darthwade.dwLoading',
  'cdAuth',
]);

require('./services/auth-service');
//require('./services/alert-service');
//require('./services/spinner-service');
require('./controllers/login-controller');
require('./controllers/header-controller');
//require('./controllers/left-navigation-controller');

function cdDashboardCtrl($scope, auth) {

}

app
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .controller('dashboard', ['$scope', 'auth', /*'spinnerService', 'alertService',*/ cdDashboardCtrl])
  //.controller('dashboard', ['$scope', cdDashboardCtrl])
  .service('cdApi', seneca.ng.web({ prefix:'/api/1.0/' }))
;

},{"./controllers/header-controller":1,"./controllers/login-controller":2,"./services/auth-service":4}],4:[function(require,module,exports){
'use strict';

angular.module('cpZenPlatform').service('auth', function($http) {

  var loggedin_user = null;
  function topfail( data ) {
    console.error(data)
  }

  return {
    login: function(creds,win,fail){
      console.log("creds == " + JSON.stringify(creds))
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
      $http({method:'POST', url: '/auth/register', data:details, cache:false}).
        success(win).error(fail||topfail)
    },

    reset: function(creds,win,fail){
      $http({method:'POST', url: '/auth/create_reset', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    reset_load: function(creds,win,fail){
      $http({method:'POST', url: '/auth/load_reset', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    reset_execute: function(creds,win,fail){
      $http({method:'POST', url: '/auth/execute_reset', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    confirm: function(creds,win,fail){
      $http({method:'POST', url: '/auth/confirm', data:creds, cache:false}).
        success(win).error(fail||topfail)
    },

    get_loggedin_user: function (win, fail) {
      if (loggedin_user) {
        win(loggedin_user);
      }
      else {
        this.instance(function (data) {
          if (!data.user) {
            return (fail || topfail)('cannot get logged in user');
          }

          loggedin_user = data.user;
          win(loggedin_user);
        });
      }
    }
  }

})

},{}]},{},[3]);
