'use strict';
angular.module('cpZenPlatform').controller('login', ['$state', '$stateParams', '$scope', '$location', '$window', 'auth', 'alertService', '$translate','$cookies', 'cdLanguagesService', 'cdUsersService', 'cdConfigService', 'utilsService', 'vcRecaptchaService', loginCtrl]);

function loginCtrl($state, $stateParams, $scope, $location, $window, auth, alertService, $translate, $cookies, cdLanguagesService, cdUsersService, cdConfigService, utilsService, vcRecaptchaService) {
  $scope.referer = $state.params.referer;

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

  $scope.login = {};
  $scope.forgot = {};
  $scope.reset = {};

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

    // We need to know if the user is registering as a champion to create a dojo.
    // This is primarily for Salesforce on the backend.
    if ($state.current.name ===  'start-dojo-wizard') {
      user.isChampion = true;
    }

    user['g-recaptcha-response'] = vcRecaptchaService.getResponse();

    auth.register(user, function(data) {
      if(data.ok) {
        auth.login(user, function(data) {
          $window.location.href = $scope.referer || '/dashboard/start-dojo';
        });
      } else {
        var reason = data.why === 'nick-exists' ? $translate.instant('user name already exists') : $translate.instant('server error');
        alertService.showAlert($translate.instant('login.register.failure')+ ' ' + reason);
      }
    }, function(err) {
         alertService.showError(JSON.stringify(err));
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
          if(_.contains(user.roles, 'cdf-admin') && !$scope.referer) {
            $scope.referer = '/dashboard/manage-dojos';
          }
          $window.location.href = $scope.referer || '/dashboard/dojo-list';
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

  $scope.doReset = function() {
    auth.execute_reset({
      token:$stateParams.token,
      password:$scope.reset.newPassword,
      repeat:$scope.reset.confirmNewPassword
    }, function (response) {
      if(response.ok) {
        alertService.showAlert($translate.instant('Successfully updated password.'));
        $state.go('login');
      } else {
        alertService.showError($translate.instant('Error') + ':' + $translate.instant(response.why));
      }
    }, function (err) {
      alertService.showError(err);
    });
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

  $scope.recap = {publicKey: '6LfVKQgTAAAAAF3wUs0q-vfrtsKdHO1HCAkp6pnY'};
}
