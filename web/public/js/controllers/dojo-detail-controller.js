'use strict';

function cdDojoDetailCtrl($scope, $window, $state, $stateParams, $location, cdDojoService, alertService, usSpinnerService, auth, dojo, gmap, $translate) {
  $scope.dojo = dojo;
  $scope.model = {};
  $scope.markers = [];
  $scope.requestInvite = {};
  $scope.userMemberCheckComplete = false;
  var currentUser;
  var approvalRequired = ['mentor', 'champion'];

  auth.get_loggedin_user(function (user) {
    currentUser = user;

    //Check if user is a member of this Dojo
    var query = {dojoId:dojo.id, userId:user.id};
    cdDojoService.getUsersDojos(query, function (response) {
      _.isEmpty(response) ? $scope.dojoMember = false : $scope.dojoMember = true;
      $scope.userMemberCheckComplete = true;
    });
  }, function () {
    //Not logged in
    $scope.userMemberCheckComplete = true;
  });

  cdDojoService.getUserTypes(function (response) {
    $scope.userTypes = response;
  });

  $scope.$watch('model.map', function(map){
    if(map) {
      var marker = new google.maps.Marker({
        map: $scope.model.map,
        position: new google.maps.LatLng(latitude, longitude)
      });
      $scope.markers.push(marker);
    }
  });

  if(gmap) {
    $scope.mapLoaded = true;
    var coordinates = $scope.dojo.coordinates.split(',');
    var latitude  = coordinates[0];
    var longitude = coordinates[1];
    $scope.mapOptions = {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

  }

  $scope.userTypeSelected = function ($item) {
    if(_.contains(approvalRequired, $item)) return $scope.approvalRequired = true;
    return $scope.approvalRequired = false;
  }

  $scope.requestToJoin = function (requestInvite) {
    var userType = requestInvite.userType;

    auth.get_loggedin_user(function (user) {
      usSpinnerService.spin('dojo-detail-spinner');
      var data = {user:user, dojoId:dojo.id, userType:userType};

      if(_.contains(approvalRequired, userType)) {
        cdDojoService.requestInvite(data, function (response) {
          usSpinnerService.stop('dojo-detail-spinner');
          alertService.showAlert($translate.instant('Invite Request Sent!'));
        });  
      } else {
        //Check if user is already a member of this Dojo
        var query = {userId:user.id, dojoId:dojo.id};
        cdDojoService.getUsersDojos(query, function (response) {
          if(_.isEmpty(response)) {
            //Save
            var userDojo = {};
            userDojo.owner = 0;
            userDojo.userId = user.id;
            userDojo.dojoId = dojo.id;
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
      $state.go('register-account', {referer:$location.url()});
    });
  }

  $scope.leaveDojo = function () {
    usSpinnerService.spin('dojo-detail-spinner');
    cdDojoService.removeUsersDojosLink(currentUser.id, dojo.id, function (response) {
      usSpinnerService.stop('dojo-detail-spinner');
      $state.go($state.current, {}, {reload: true});
    }, function (err) {
      alertService.showError($translate.instant('Error leaving Dojo'));
    });
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'cdDojoService', 'alertService', 'usSpinnerService', 'auth', 'dojo', 'gmap', '$translate', cdDojoDetailCtrl]);
