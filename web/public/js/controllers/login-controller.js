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
