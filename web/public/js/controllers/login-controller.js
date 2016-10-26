'use strict';

angular.module('cpZenPlatform').controller('login', ['$state', '$stateParams', '$scope', '$rootScope', '$location', '$window',
  'auth', 'alertService', '$translate', 'cdUsersService', 'cdConfigService', 'utilsService', 'vcRecaptchaService',
  'usSpinnerService', '$cookieStore', 'cdDojoService', '$q', 'dojoUtils', 'WizardHandler', 'userUtils', 'atomicNotifyService', loginCtrl]);

function loginCtrl($state, $stateParams, $scope, $rootScope, $location, $window,
  auth, alertService, $translate, cdUsersService, cdConfigService, utilsService, vcRecaptchaService,
  usSpinnerService, $cookieStore, cdDojoService, $q, dojoUtils, WizardHandler, userUtils, atomicNotifyService) {

  $scope.noop = angular.noop;
  var refererUrl = $state.params.referer || $state.params.next;
  $scope.referer = refererUrl ? decodeURIComponent(refererUrl) : refererUrl;

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
    var userType = _.find($scope.initUserTypes, function(type) { return type.name===$state.params.userType});
    if (userType) {
      $scope.registerUser = {initUserType: userType};
    }
  });

  if (_.isUndefined($scope.formData)) {
    $scope.formData = {};
    $scope.formData.user = {};
  }
  if (_.isUndefined($scope.userFormData)) {
    $scope.userFormData = {};
    $scope.userFormData.profile = {};
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
            return _.includes(userDojo.userTypes, 'attendee-o13');
          });
          if(userTypesFound) return deferred.resolve(true);
          cdConfigService.get('forumModerators', function (response) {
            if(_.includes(response.forumModerators, user.email)) return deferred.resolve(true);
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
    $scope.userFormData.recaptchaResponse = response;
  }

  $scope.recaptchaExpired = function () {
    $scope.userFormData.recaptchaResponse = null;
  }

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.picker = {opened: false};

  $scope.open = function () {
    $scope.picker.opened = true;
  };

  $scope.showButton = true;
  if ($state.current.name === 'start-dojo') {
    $scope.showButton = false;
  }

  $scope.next = function () {
    $state.go('register-account.profile', { referer: $scope.referer});
  }

  cdDojoService.listCountries(function(countries) {
    $scope.countries = countries;
  });

  var initialDate = new Date();
  initialDate.setFullYear(initialDate.getFullYear()-18);
  $scope.dobDateOptions = $scope.childDobDateOptions = {
    formatYear: 'yyyy',
    startingDay: 1,
    'datepicker-mode': "'year'",
    initDate: initialDate
  };

  $scope.setCountry = function(country) {
    $scope.userFormData.profile.countryname = country.countryName;
    $scope.userFormData.profile.countrynumber = country.countryNumber;
    $scope.userFormData.profile.continent = country.continent;
    $scope.userFormData.profile.alpha2 = country.alpha2;
    $scope.userFormData.profile.alpha3 = country.alpha3;
  };


  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
  };

  $scope.setPlace = function(place) {
    $scope.userFormData.profile.placeName = place.name;
    $scope.userFormData.profile.placeGeonameId = place.geonameId;
    $scope.userFormData.profile.county = {};
    $scope.userFormData.profile.state = {};
    $scope.userFormData.profile.city = {};
    for (var adminidx=1; adminidx<=4; adminidx++) {
      $scope.userFormData.profile['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
      $scope.userFormData.profile['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
    }
  };

  $scope.doRegister = function() {
    userUtils.doRegister(_.extend($scope.formData, $scope.userFormData, {referer: $scope.referer}));
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
          // User Login
          if ($scope.redirect) {
            $window.location.href = $scope.redirect;
          } else {
            var user = data.user;
            if (_.includes(user.roles, 'cdf-admin') && !$scope.referer) {
              $scope.referer = '/dashboard/manage-dojos';
            }
            if ($stateParams.eventId){
              $scope.referer = $state.href('event', {
                eventId: $stateParams.eventId
              });
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
      emailSubject: 'CoderDojo Zen Password Reset Request'
    }, function(response) {
      usSpinnerService.stop('login-spinner');

      if(!response.ok && response.why === 'user-not-found'){
        alertService.showError(msgmap['email-not-found']);
      } else {
        atomicNotifyService.info(msgmap['reset-sent']);
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
			if (path === '/') {
				$window.location.href = 'dashboard';
			}
		}
	});

  $scope.showBanner = function () {
    if(path.indexOf("/dojo")>=0){
      return true;
    } else {
      return false;
    }
  }

  $scope.recap = {publicKey: '6LfVKQgTAAAAAF3wUs0q-vfrtsKdHO1HCAkp6pnY'};
}
