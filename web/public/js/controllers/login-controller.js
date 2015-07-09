'use strict';

angular.module('cpZenPlatform').controller('login', ['$state', '$scope', '$location', '$window', 'auth', 'alertService', '$translate','$cookies', 'cdLanguagesService', 'cdUsersService', 'cdConfigService', 'utilsService', 'vcRecaptchaService', loginCtrl]);

function loginCtrl($state, $scope, $location, $window, auth, alertService, $translate, $cookies, cdLanguagesService, cdUsersService, cdConfigService, utilsService, vcRecaptchaService) {
  $scope.referer = $state.params.referer ? $state.params.referer : '/dojo-list';
  if ($location.search().redirect) {
    $scope.redirect = $location.search().redirect;
  }

  var msgmap = {
    'unknown': $translate.instant('login.msgmap.unknown'),
    'user-not-found': $translate.instant('login.msgmap.user-not-found'),
    'invalid-password': $translate.instant('login.msgmap.invalid-password'),
    'reset-sent': $translate.instant('login.msgmap.reset-sent')
  }

  var path = window.location.pathname

  $scope.login = {}
  $scope.forgot = {}

  cdUsersService.getInitUserTypes(function (response) {
    $scope.initUserTypes = response;
  });

  $scope.isVisible = function(view) {
    return $scope.currentView === view
  }

  $scope.show = function(view) {
    $scope.message = ''
    $scope.errorMessage = ''

    $scope.currentView = view
  }

  // This redirect function is not strictly to do with login, just lives here for convenience.
  // Gets the redirect link to the Adult Forum from the server side 'webclient' config.
  $scope.adultForums = function() {
    cdConfigService.get('adultforum', function(kv) {
      var url = kv.adultforum;
      $window.location.href = url;
    }, function(err) {
         console.error('Error getting config: ', err);
       });
  }

  $scope.doRegister = function(user) {
    if(vcRecaptchaService.getResponse() === ""){
      return alertService.showError("Please resolve the captcha");
    }

    user['g-recaptcha-response'] = vcRecaptchaService.getResponse();

    auth.register(user, function(data) {
      if(data.ok) {
        alertService.showAlert('Thank you for registering. Your CoderDojo account has been successfully created. You can now register to become a Champion and create a Dojo.', function() {
          auth.login(user, function(data) {
            $window.location.href = '/dashboard/start-dojo';
          });
        });
      } else {
        var reason = data.why === 'nick-exists' ? $translate.instant('user name already exists') : $translate.instant('server error');
        alertService.showAlert($translate.instant('login.register.failure')+ ' ' + reason);
      }
    }, function(err) {
         alertService.showError('An error occurred while registering account: ' + err);
       });
  };

  $scope.doLogin = function() {
    $scope.message = '';
    $scope.errorMessage = '';

    if (!$scope.loginForm.$valid) {
      return;
    }

    auth.login($scope.login,
      function(data){
          var user = data.user;
          if(_.contains(user.roles, 'cdf-admin')) {
            $scope.referer = '/manage-dojos';
          }
          $window.location.href = '/dashboard' + $scope.referer;
        },
        function(){
          $scope.errorMessage = $translate.instant('Invalid email or password');
          $scope.errorMessage = 'Invalid email or password!';
        }
     );
  };

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

  $scope.goHome = function() {
    window.location.href = '/'
  };

  $scope.logout = function(){
    auth.logout(function(data){
      $window.location.href = '/'
    })
  }

  $scope.validatePassword = function (password, email) {
    var validationResult = utilsService.validatePassword(password, email);
    if(!validationResult.valid) $scope.invalidPasswordMessage = $translate.instant(validationResult.msg);
    return validationResult.valid;
  }

  $scope.matchesPassword = function(password, passwordConfirm) {
    if(passwordConfirm !== password) {
      $scope.invalidConfirmPasswordMessage = $translate.instant('Passwords do not match');
      return false;
    }
    return true;
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
