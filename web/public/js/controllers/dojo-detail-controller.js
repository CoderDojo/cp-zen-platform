'use strict';

function cdDojoDetailCtrl($scope, $window, $state, $stateParams, $location, cdDojoService, alertService, usSpinnerService, auth, dojo, gmap, $translate) {
  $scope.dojo = dojo;
  $scope.model = {};
  $scope.markers = [];
  $scope.requestInvite = {};
  
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

  $scope.requestToJoin = function (requestInvite) {
    var userType = requestInvite.userType;
    auth.get_loggedin_user(function (user) {
      usSpinnerService.spin('dojo-detail-spinner');
      var data = {user:user, dojoId:dojo.id, userType:userType};
      cdDojoService.requestInvite(data, function (response) {
        usSpinnerService.stop('dojo-detail-spinner');
        alertService.showAlert($translate.instant('Invite Request Sent!'));
      });
    }, function () {
      //Not logged in
      $state.go('register-account', {referer:$location.url()});
    });
  }

}

angular.module('cpZenPlatform')
  .controller('dojo-detail-controller', ['$scope', '$window', '$state', '$stateParams', '$location', 'cdDojoService', 'alertService', 'usSpinnerService', 'auth', 'dojo', 'gmap', '$translate', cdDojoDetailCtrl]);
