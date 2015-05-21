'use strict';

angular.module('cpZenPlatform').controller('login', ['$state', '$scope', '$location', '$window', 'auth', 'alertService', loginCtrl]);

  function loginCtrl($state, $scope, $location, $window, auth, alertService) {
    var referer = $state.params.referer ? $state.params.referer : '/dojo-list';
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

    $scope.doRegister = function(user) {
      auth.register(user, function(data) {
        if(data.ok) {
          alertService.showAlert('Thank You for Registering. Your Coder Dojo Account has been successfully created. You can now Register to become a Champion and Create a Dojo.', function() {
            auth.login(user, function(data) {
              $window.location.href = '/dashboard/start-dojo';
            });
          });
        } else {
          var reason = data.why === 'nick-exists' ? 'user name already exists' : 'server error';
          alertService.showAlert('There was a problem registering your account: ' + reason);
        }
      }, function() {
        
      });
    }

    $scope.doLogin = function() {
      $scope.message = ''
      $scope.errorMessage = ''

      if (!$scope.loginForm.$valid) {
        return
      }

      auth.login($scope.login,
        function(data){
          $window.location.href = '/dashboard' + referer;
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
    });

  }
