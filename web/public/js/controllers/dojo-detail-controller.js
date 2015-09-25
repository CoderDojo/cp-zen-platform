'use strict';
/* global google */

function cdDojoDetailCtrl($scope, $state, $location, cdDojoService, cdUsersService, alertService, usSpinnerService, auth, dojo, gmap, $translate, currentUser) {
  $scope.dojo = dojo;
  $scope.model = {};
  $scope.markers = [];
  $scope.requestInvite = {};
  $scope.userMemberCheckComplete = false;
  currentUser = currentUser.data;
  var approvalRequired = ['mentor', 'champion'];

  var latitude, longitude;

  if(!_.isEmpty(currentUser)) {
    if(!dojo || !dojo.id){
      return $state.go('error-404-no-headers');
    }

    if(!dojo.verified && dojo.creator !== currentUser.id && !_.contains(currentUser.roles, 'cdf-admin')){
      return $state.go('error-404-no-headers');
    }

    //Check if user is a member of this Dojo
    var query = {dojoId:dojo.id, userId: currentUser.id};
    cdDojoService.getUsersDojos(query, function (response) {
      $scope.dojoMember = !_.isEmpty(response);
      $scope.dojoOwner = false;
      if($scope.dojoMember) $scope.dojoOwner = (response[0].owner === 1) ? true : false;
      $scope.userMemberCheckComplete = true;
    });
  } else {
    if(!dojo || !dojo.id || !dojo.verified) return $state.go('error-404-no-headers');
    $scope.userMemberCheckComplete = true;
  }

  cdUsersService.getInitUserTypes(function (response) {
    var userTypes = _.filter(response, function(type) { return type.name.indexOf('u13') === -1; });
    $scope.initUserTypes = userTypes;
  });

  cdDojoService.getDojoConfig(function(json){
    $scope.dojoStages = _.map(json.dojoStages, function(item){
      return { value: item.value, label: $translate.instant(item.label) };
    });
    $scope.dojo.stage = _.find($scope.dojoStages, function(obj) { return obj.value === $scope.dojo.stage })
  });

  $scope.$watch('model.map', function(map){
    if(map) {
      if(latitude && longitude) {
        var marker = new google.maps.Marker({
          map: $scope.model.map,
          position: new google.maps.LatLng(latitude, longitude)
        });
        $scope.markers.push(marker);
      }
    }
  });

  if(gmap) {
    if($scope.dojo.coordinates) {
      var coordinates = $scope.dojo.coordinates.split(',');
      latitude  = coordinates[0];
      longitude = coordinates[1];
      $scope.mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.mapLoaded = true;
    } else {
      var countryCoordinates;
      cdDojoService.loadCountriesLatLongData(function (response) {

        countryCoordinates = response[$scope.dojo.alpha2];

        $scope.mapOptions = {
          center: new google.maps.LatLng(countryCoordinates[0], countryCoordinates[1]),
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.mapLoaded = true;
      });
    }
  }

  $scope.userTypeSelected = function ($item) {
    if(_.contains(approvalRequired, $item)) return $scope.approvalRequired = true;
    return $scope.approvalRequired = false;
  };

  $scope.requestToJoin = function (requestInvite) {
    if(!$scope.requestInvite.userType) {
      $scope.requestInvite.validate="false";
      return
    } else {
      var userType = requestInvite.userType.name;

      auth.get_loggedin_user(function (user) {
        usSpinnerService.spin('dojo-detail-spinner');
        var data = {user:user, dojoId:dojo.id, userType:userType, emailSubject: $translate.instant('New Request to join your Dojo')};

        if(_.contains(approvalRequired, userType)) {
          cdDojoService.requestInvite(data, function (response) {
            usSpinnerService.stop('dojo-detail-spinner');
            if(!response.error) {
              alertService.showAlert($translate.instant('Join Request Sent!'));
            } else {
              alertService.showError($translate.instant(response.error));
            }
          });
        } else {
          //Check if user is already a member of this Dojo
          var query = {userId:user.id, dojoId:dojo.id};
          var userDojo = {};
          cdDojoService.getUsersDojos(query, function (response) {
            if(_.isEmpty(response)) {
              //Save
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
  };

  $scope.leaveDojo = function () {
    usSpinnerService.spin('dojo-detail-spinner');
    cdDojoService.removeUsersDojosLink({userId: currentUser.id, dojoId: dojo.id, emailSubject: $translate.instant('A user has left your Dojo')}, function (response) {
      usSpinnerService.stop('dojo-detail-spinner');
      $state.go($state.current, {}, {reload: true});
    }, function (err) {
      alertService.showError($translate.instant('Error leaving Dojo'));
    });
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$state', '$location', 'cdDojoService', 'cdUsersService', 'alertService', 'usSpinnerService', 'auth', 'dojo', 'gmap', '$translate', 'currentUser', cdDojoDetailCtrl]);

