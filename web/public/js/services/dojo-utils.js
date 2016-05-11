'use strict';

angular.module('cpZenPlatform').factory('dojoUtils', function($location, $translate, $state, $rootScope, cdDojoService, cdUsersService, auth, usSpinnerService, alertService){
  var dojoUtils = {};

  var approvalRequired = ['mentor', 'champion'];
  var dId = localStorage.getItem('dojoId');

  dojoUtils.requestToJoin = function (requestInvite) {
    if(!requestInvite.userType) {
      window.alert('Error');
      return
    } else {
      var userType = requestInvite.userType.name;

      auth.get_loggedin_user(function (user) {
        usSpinnerService.spin('dojo-detail-spinner');
        var data = {user:user, dojoId:dId, userType:userType, emailSubject: $translate.instant('New Request to join your Dojo')};

        if(_.contains(approvalRequired, userType)) {
          cdDojoService.requestInvite(data, function (response) {
            usSpinnerService.stop('dojo-detail-spinner');
            if(!response.error) {
              alertService.showAlert($translate.instant('Join Request Sent'));
            } else {
              alertService.showError($translate.instant(response.error));
            }
          });
        } else {
          //Check if user is already a member of this Dojo
          var query = {userId:user.id, dojoId:dId};
          var userDojo = {};
          cdDojoService.getUsersDojos(query, function (response) {
            if(_.isEmpty(response)) {
              //Save
              userDojo.owner = 0;
              userDojo.userId = user.id;
              userDojo.dojoId = dId;
              userDojo.userTypes = [userType];
              cdDojoService.saveUsersDojos(userDojo, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                $state.go($state.current, {}, {reload: true});
                alertService.showAlert($translate.instant('Successfully Joined Dojo'));
              });
            } else {
              //Update
              userDojo = response[0];
              if(!userDojo.userTypes) userDojo.userTypes = [];
              userDojo.userTypes.push(userType);
              cdDojoService.saveUsersDojos(userDojo, function (response) {
                usSpinnerService.stop('dojo-detail-spinner');
                $state.go($state.current, {}, {reload: true});
                alertService.showAlert($translate.instant('Successfully Joined Dojo'));
              });
            }
          });
        }
      }, function () {
        //Not logged in
        $state.go('register-account', {referer:$location.url(), userType: userType});
      });
    }
  };
  return dojoUtils;
});
