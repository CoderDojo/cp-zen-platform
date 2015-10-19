'use strict';

angular.module('cpZenPlatform').controller('login', ['$state', '$stateParams', '$scope', '$rootScope', '$location', '$window',
  'auth', 'alertService', '$translate', 'cdUsersService', 'cdConfigService', 'utilsService', 'vcRecaptchaService', '$localStorage',
  'usSpinnerService', '$cookieStore', 'cdDojoService', '$q', loginCtrl]);

function loginCtrl($state, $stateParams, $scope, $rootScope, $location, $window,
  auth, alertService, $translate, cdUsersService, cdConfigService, utilsService, vcRecaptchaService, $localStorage,
  usSpinnerService, $cookieStore, cdDojoService, $q) {

  $scope.noop = angular.noop
  $scope.referer = $state.params.referer;

  if ($location.search().redirect) {
    $scope.redirect = $location.search().redirect;
  }

  var msgmap = {
    'unknown': $translate.instant('Unable to perform your request at this time - please try again later.'),
    'user-not-found': $translate.instant('Email address is not recognized.'),
    'invalid-password': $translate.instant('That password is incorrect'),
    'reset-sent': $translate.instant('An email with password reset instructions has been sent to you.'),
    'email-not-found': $translate.instant('Email address not found')
  }

  var path = window.location.pathname

  $scope.login = {};
  $scope.forgot = {};
  $scope.reset = {};

  cdUsersService.getInitUserTypes(function (userTypes) {
    $scope.initUserTypes = _.filter(userTypes, function(userType){
      return userType.name !== 'attendee-u13';
    });
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

  $scope.youthForums = function () {
    cdConfigService.get('youthforum', function (kv) {
      var url = kv.youthforum;
      $window.location.href = url;
    }, function (err) {
      console.error('Error getting config: ', err);
    });
  }

  if(!$cookieStore.get('canViewYouthForums')) {
    canViewYouthForums().then(function (hasPermission) {
      $scope.canViewYouthForums = hasPermission;
      $cookieStore.put('canViewYouthForums', hasPermission);
    }, function (err) {
      $scope.canViewYouthForums = false;
    });
  } else {
    $scope.canViewYouthForums = $cookieStore.get('canViewYouthForums');
  }

  function canViewYouthForums() {
    var deferred = $q.defer();
    auth.get_loggedin_user(function (user) {
      cdUsersService.userProfileData({userId: user.id}, function (userProfile) {
        if(userProfile.userType === 'attendee-o13') return deferred.resolve(true);
        cdDojoService.getUsersDojos({userId: user.id}, function (usersDojos) {
          var userTypesFound = _.find(usersDojos, function (userDojo) {
            return _.contains(userDojo.userTypes, 'attendee-o13');
          });
          if(userTypesFound) return deferred.resolve(true);
          cdConfigService.get('forumModerators', function (response) {
            if(_.contains(response.forumModerators, user.email)) return deferred.resolve(true);
            return deferred.resolve(false);
          });
        }, function (err) {
          console.error(err);
          deferred.reject(err);
        })
      }, function (err){
        console.error(err);
        deferred.reject(err);
      });
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  $scope.setRecaptchaResponse = function (response) {
    $scope.recaptchaResponse = response;
  }

  $scope.recaptchaExpired = function () {
    $scope.recaptchaResponse = null;
  }

  $scope.doRegister = function(user) {
    if(!$scope.recaptchaResponse) return alertService.showError($translate.instant('Please resolve the captcha'));

    // We need to know if the user is registering as a champion to create a dojo.
    // This is primarily for Salesforce on the backend.
    if (user.initUserType.name ===  'champion') {
      user.isChampion = true;
    }

    user['g-recaptcha-response'] = $scope.recaptchaResponse;
    user.emailSubject = $translate.instant('Welcome to Zen, the CoderDojo community platform.');

    auth.register(user, function(data) {
      if(data.ok) {
        auth.login(user, function(data) {
          var initUserTypeStr = data.user && data.user.initUserType;
          var initUserType = JSON.parse(initUserTypeStr);
          if(initUserType.name === 'champion'){
            $window.location.href = '/dashboard/start-dojo';
          } else {
            $window.location.href = $scope.referer || '/dashboard/profile/' + data.user.id + '/edit';
          }
        });
      } else {
        var reason;

        if(data.why === 'nick-exists'){
          reason = $translate.instant('user name already exists');
        }

        if(data.error === 'captcha-failed'){
          reason = $translate.instant('captcha error');
        }

        alertService.showAlert($translate.instant('There was a problem registering your account:')+ ' ' + reason, function(){
          if($scope.referer){
            $state.reload($scope.referer);
          } else {
            $state.reload('register-account');
          }
        });
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
        if(data.ok) {
          $cookieStore.remove('recommendedPracticesAlertShown');
          if ($scope.redirect) {
            $window.location.href = $scope.redirect;
          } else {
            var user = data.user;
            if (_.contains(user.roles, 'cdf-admin') && !$scope.referer) {
              $scope.referer = '/dashboard/manage-dojos';
            }
            $window.location.href = $scope.referer || '/dashboard/dojo-list';
          }
        } else {
          var reason;

          if(data.why === 'invalid-password'){
            reason = $translate.instant('Invalid email or password');
          } else {
            reason = $translate.instant(data.why);
          }

          alertService.showAlert($translate.instant('There was a problem logging in:')+ ' ' + reason);
        }
      },
      function(){
        $scope.errorMessage = $translate.instant('Invalid email or password');
      }
     );
  };

  $scope.sendPasswordResetEmail = function() {
    usSpinnerService.spin('login-spinner');
    $scope.message = ''
    $scope.errorMessage = ''

    if (!$scope.forgotPasswordForm.$valid) {
      usSpinnerService.stop('login-spinner');
      return;
    }

    auth.reset({
      email:$scope.forgot.email,
      emailSubject: $translate.instant('CoderDojo Zen Password Reset Request')
    }, function(response) {
      usSpinnerService.stop('login-spinner');

      if(!response.ok && response.why === 'user-not-found'){
        alertService.showError(msgmap['email-not-found']);
      } else {
        $scope.message = msgmap['reset-sent'];
      }

    }, function(out) {
      usSpinnerService.stop('login-spinner');
      $scope.errorMessage = msgmap[out.why] || msgmap.unknown
    })
  }


  $scope.goHome = function() {
    window.location.href = '/'
  };

  $scope.logout = function() {
    $cookieStore.remove('verifyProfileComplete');
    $cookieStore.remove('canViewYouthForums');
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
      $scope.$on('user-updated', function ($event, updatedUser) {
        $scope.user = updatedUser;
     });
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
