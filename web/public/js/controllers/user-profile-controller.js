'use strict';

function cdUserProfileCtrl($scope, $state, auth, cdUsersService, cdDojoService, alertService, $translate) {
  var userId = $state.params.userId;
  var userType;
  $scope.profileData = {};

  cdUsersService.load(userId, function (response) {
    $scope.profileData.user = response;
    cdUsersService.listProfiles({userId:userId}, function (response) {
      $scope.profileData.profile = response;
    });
  }, function (err) {
    alertService.showError($translate.instant('Error loading profile') + ' ' + err);
  });

  cdDojoService.dojosForUser(userId, function (response) {
    $scope.dojos = response;
    if(_.isEmpty($scope.dojos)) {
      //This user has no Dojos.
      //Use init user type to setup profile.
      auth.get_loggedin_user(function (user) {
        userType = user.initUserType.name;
      });
    } else {
      //Search usersdojos for highest user type
      findHighestUserType();
    }
  }, function (err) {
    alertService.showError( $translate.instant('Error loading Dojos') + ' ' + err);
  });

  function findHighestUserType() {
    var highestTypeFound = false;
    cdDojoService.getUsersDojos({userId:userId}, function (usersDojosLinks) {

      function checkLinks(userType) {
        for(var i = 0; i < usersDojosLinks.length; i++) {
          var userDojoLink = usersDojosLinks[i];
          var userTypes = userDojoLink.userTypes;
          if(_.contains(userTypes, userType)) {
            highestTypeFound = true;
            return userType;
          }
        }
      }

      //If no champion found, search for next user type
      var searchForUserTypes = ['champion', 'mentor', 'parent-guardian', 'attendee-o13', 'attendee-u13'];

      _.each(searchForUserTypes, function (searchForUserType) {
        if(!highestTypeFound) userType = checkLinks(searchForUserType);
      });

    });
  }
  
}

angular.module('cpZenPlatform')
    .controller('user-profile-controller', ['$scope', '$state', 'auth', 'cdUsersService', 'cdDojoService', 'alertService', '$translate' , cdUserProfileCtrl]);