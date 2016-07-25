'use strict';

angular.module('cpZenPlatform').factory('dojoUtils', function($location, $translate, $state, $rootScope, cdDojoService, cdUsersService, auth, usSpinnerService, alertService){
  var dojoUtils = {};

  var approvalRequired = ['mentor', 'champion'];

  dojoUtils.requestToJoin = function (requestInvite, dojoId) {
    if(!requestInvite.userType) {
      window.alert('Error');
      return
    } else {
      var userType = requestInvite.userType.name;

      auth.get_loggedin_user(function (user) {
        usSpinnerService.spin('dojo-detail-spinner');
        var data = {user:user, dojoId:dojoId, userType:userType, emailSubject: 'New Request to join your Dojo'};

        //Check if user is already a member of this Dojo
        var query = {userId:user.id, dojoId:dojoId};
        cdDojoService.getUsersDojos(query, function (response) {
          if(_.isEmpty(response)) {
            if(_.includes(approvalRequired, userType)) {
              cdDojoService.requestInvite(data, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                if(!response.error) {
                  alertService.showAlert($translate.instant('Join Request Sent'));
                } else {
                  alertService.showError($translate.instant(response.error));
                }
              });
            } else {
              //Save
              var userDojo = {};
              userDojo.owner = 0;
              userDojo.userId = user.id;
              userDojo.dojoId = dojoId;
              userDojo.userTypes = [userType];
              cdDojoService.saveUsersDojos(userDojo, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                $state.go($state.current, $state.params, {reload: true});
                alertService.showAlert($translate.instant('Successfully Joined Dojo'));
              });
            }
          }
        });
      }, function () {
        //Not logged in
        $state.go('register-account', {referer:$location.url(), userType: userType});
      });
    }
  };

  dojoUtils.getDojoURL = function(dojo) {
    if (dojo) {
      var urlSlug = dojo.url_slug || dojo.urlSlug;
      return "/dojo/" + urlSlug;
    }
  }
  return dojoUtils;
});
