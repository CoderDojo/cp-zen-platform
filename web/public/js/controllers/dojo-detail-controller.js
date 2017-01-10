'use strict';
/* global google */

function cdDojoDetailCtrl($scope, $state, $location, cdDojoService, cdUsersService, alertService, usSpinnerService, auth, dojo, gmap, $translate, currentUser, dojoUtils) {

  $scope.needMentorsTooltip = '<a href="http://kata.coderdojo.com/wiki/Mentor_Guide" target="_blank">' + $translate.instant('Find out more about becoming a CoderDojo mentor') + '</a>';
  $scope.dojo = dojo;
  $scope.model = {};
  $scope.markers = [];
  $scope.currentUser = currentUser.data;
  $scope.isDojoAdmin = false;
  var latitude, longitude;

  if(!_.isEmpty($scope.currentUser)) {
    if(!dojo || !dojo.id){
      return $state.go('error-404-no-headers');
    }

    if(!dojo.verified && dojo.creator !== $scope.currentUser.id && !_.includes($scope.currentUser.roles, 'cdf-admin')){
      return $state.go('error-404-no-headers');
    }

  } else {
    if(!dojo || !dojo.id || !dojo.verified) return $state.go('error-404-no-headers');
    $scope.userMemberCheckComplete = true;
  }

  cdDojoService.getDojoConfig(function(json){
    $scope.dojoStages = _.map(json.dojoStages, function(item){
      return { value: item.value, label: $translate.instant(item.label) };
    });
    $scope.dojo.stage = _.find($scope.dojoStages, function(obj) { return obj.value === $scope.dojo.stage })
  });

  dojoUtils.isHavingPerm(currentUser, dojo.id, 'dojo-admin')
  .then(function () {
    $scope.isDojoAdmin = true;
  })
  .catch(function () {
    $scope.isDojoAdmin = false;
  });

  dojoUtils.isHavingPerm(currentUser, dojo.id, 'ticketing-admin')
  .then(function () {
    $scope.isTicketingAdmin = true;
  })
  .catch(function () {
    $scope.isTicketingAdmin = false;
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

  $scope.leaveDojo = function () {
    usSpinnerService.spin('dojo-detail-spinner');
    cdDojoService.removeUsersDojosLink({userId: $scope.currentUser.id, dojoId: dojo.id, emailSubject: 'A user has left your Dojo'}, function (response) {
      usSpinnerService.stop('dojo-detail-spinner');
      $state.go($state.current, {}, {reload: true});
    }, function (err) {
      alertService.showError($translate.instant('Error leaving Dojo'));
    });
  };

}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$state', '$location', 'cdDojoService', 'cdUsersService', 'alertService', 'usSpinnerService', 'auth', 'dojo', 'gmap', '$translate', 'currentUser', 'dojoUtils', cdDojoDetailCtrl]);
