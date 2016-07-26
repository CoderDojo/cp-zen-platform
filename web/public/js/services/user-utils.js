'use strict';

angular.module('cpZenPlatform').factory('userUtils', ['$location', '$window', '$translate', '$state', '$rootScope', 'cdDojoService', 'cdUsersService', 'auth', 'usSpinnerService', 'alertService', function($location, $window, $translate, $state, $rootScope, cdDojoService, cdUsersService, auth, usSpinnerService, alertService){
  var userUtils = {};

  var approvalRequired = ['mentor', 'champion'];

  function getAge(birthDate) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  userUtils.doRegister = function (userFormData) {
    console.log(userFormData);
    if(!userFormData.recaptchaResponse) return alertService.showError($translate.instant('Please resolve the captcha'));
    delete userFormData.passwordConfirm;

    // We need to know if the user is registering as a champion to create a dojo.
    // This is primarily for Salesforce on the backend.
    if (userFormData.user.initUserType && userFormData.user.initUserType.name ===  'champion') {
      userFormData.user.isChampion = true;
    }

    userFormData.user['g-recaptcha-response'] = userFormData.recaptchaResponse;
    userFormData.user.emailSubject = 'Welcome to Zen, the CoderDojo community platform.';

    if (getAge(userFormData.profile.dob) >= 18) {
      userFormData.user.initUserType = {'title':'Parent/Guardian','name':'parent-guardian'};
    } else if (getAge(userFormData.profile.dob) >= 13) {
      userFormData.user.initUserType = {'title':'Youth Over 13','name':'attendee-o13'};
    } else {
      return alertService.showError($translate.instant('Sorry only users over 13 can signup, but your parent or guardian can sign up and create you an account'));
    }
    var user = userFormData.user;
    auth.register(userFormData, function(data) {
      userFormData.referer = userFormData.referer && userFormData.referer.indexOf("/dashboard/") === -1 ? '/dashboard' + userFormData.referer : userFormData.referer;
      if(userFormData.referer) localStorage.setItem('dojoUrlSlug', userFormData.referer);
      if(data.ok) {
        auth.login(user, function(data) {
          var initUserTypeStr = data.user && data.user.initUserType;
          var initUserType = JSON.parse(initUserTypeStr);
          //We use window.location because we need a global reload of templates to take into account the fact that the user is logged-in
          if($state.current.name === 'start-dojo'){
            $window.location.href = $state.href('start-dojo');
          } else {
            if(userFormData.referer && (userFormData.referer.indexOf('event') > -1 || userFormData.referer.indexOf('/dojo') > -1)){
              localStorage.setItem('joinDojo', true);
            }
            $window.location.href = $state.href('edit-user-profile', {userId : data.user.id});
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

        alertService.showAlert($translate.instant('There was a problem registering your account:') + ' ' + reason, function(){
          if(userFormData.referer){
            $window.location.href = userFormData.referer;
          } else {
            $state.reload('register-account.user');
          }
        });
      }
    }, function(err) {
      alertService.showError(JSON.stringify(err));
    });
  };

  return userUtils;
}]);
