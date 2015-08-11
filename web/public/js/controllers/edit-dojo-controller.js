'use strict';
/* global google */

function cdEditDojoCtrl($scope, $window, $location, cdDojoService, cdCountriesService, alertService, Geocoder, gmap, auth, 
  $state, $q, $translate, $sanitize, utilsService, currentUser, cdUsersService, $localStorage) {
  
  $scope.dojo = {};
  $scope.model = {};
  $scope.markers = [];
  $scope.buttonText = $translate.instant('Update Dojo');
  $scope.hideUserSelect = true;

  $scope.isCDFAdmin = currentUser && currentUser.data && _.contains(currentUser.data.roles, 'cdf-admin');

  var DEFAULT_COORDS = '53.3478,6.2597';

  auth.get_loggedin_user(function(user) {
    $scope.user = user;
  });

  cdDojoService.getDojoConfig(function(json){
    $scope.dojoStages = _.map(json.dojoStages, function(item){
      return { value: item.value, label: $translate.instant(item.label) };
    });
  });

  $scope.noop = angular.noop;

  $scope.toggleUserSelect = function(event){
    $scope.hideUserSelect = !$scope.hideUserSelect;
  };

  $scope.scrollToInvalid = function(form){
    $scope.getLocationFromAddress($scope.dojo);
    $scope.dojo.coordinates = $scope.dojo.place.latitude + ', ' + $scope.dojo.place.longitude;

    if(form.$invalid){
      angular.element('form[name=' + form.$name + '] .ng-invalid')[0].scrollIntoView();
    }
  };

  async.waterfall([function(done){
    var dojoId = $state.params.id;
    
    cdDojoService.load(dojoId, function(response) {
      if(!_.isEmpty(response)) {
        return done(null,response);
      } else {
        return done($translate.instant('Failed to load Dojo'));
      }
    });
  }, function(dojo, done){
    var query = {};

    query.dojoId = dojo.id;
    
    query.owner = 1;
    
    cdDojoService.getUsersDojos(query, function(response){

      return done(null, dojo, response[0]);
      }, function(){
        return done($translate.instant('Failed to load Dojo'));
      });


  }, function(dojo, prevFounder , done){
    
    if(_.isEmpty(prevFounder)){
      return done(null, dojo);
    }

    cdUsersService.load(prevFounder.userId, function(response){
      prevFounder.email = response.email;
      prevFounder.name = response.name;

      return done(null, dojo, prevFounder);
    }, function(err){
      return done(err);
    });
  }], function(err, dojo, prevFounder){
    if(err){
      alertService.showError(err);
      return;
    }

    $scope.dojo = dojo;
    $scope.prevFounder = prevFounder;
    $scope.founder  = angular.copy(prevFounder);
    loadDojoMap();
    updateFromLocalStorage();
  });
  
  $scope.getUsersByEmails = function(email){
    if(!email || !email.length || email.length < 3) {
      $scope.users = [];
      return;
    }

    var win = function(users){
      $scope.users = users;
    };

    var fail = function(){
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
    };

    cdUsersService.getUsersByEmails(email, win, fail);
  }; 

  $scope.setFounder = function(founder){
    if(founder){
      $scope.founder = founder;
      $scope.founder.previousFounderId = $scope.prevFounder.userId;
      $scope.founder.dojoId = $scope.dojo.id;
    }
  }

  function loadDojoMap() {
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

      var coordsStr = $scope.dojo.coordinates;

      if(!coordsStr){
        coordsStr = DEFAULT_COORDS;
      }

      var coordinates = coordsStr.split(',');
      var latitude  = coordinates[0];
      var longitude = coordinates[1];

      $scope.mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

    }
    $scope.dojoPageReady = true;
  }

  function updateFromLocalStorage() {
    if($localStorage.editDojoListing) {
      alertService.showAlert($translate.instant('There are unsaved changes on this page'));
      if($localStorage.editDojoListing.name) $scope.dojo.name = $localStorage.editDojoListing.name;
      if($localStorage.editDojoListing.email) $scope.dojo.email = $localStorage.editDojoListing.email;
      if($localStorage.editDojoListing.time) $scope.dojo.time = $localStorage.editDojoListing.time;
      if($localStorage.editDojoListing.country) {
        $scope.dojo.country = $localStorage.editDojoListing.country;
        $scope.setCountry($scope.dojo, $localStorage.editDojoListing.country);
      }
      if($localStorage.editDojoListing.place) {
        $scope.dojo.place = $localStorage.editDojoListing.place;
        $scope.setPlace($scope.dojo, $localStorage.editDojoListing.place);
      }
      if($localStorage.dojoListing.country && $localStorage.editDojoListing.place) {
        $scope.getLocationFromAddress($scope.dojo);
      }
      if($localStorage.editDojoListing.address1) $scope.dojo.address1 = $localStorage.editDojoListing.address1;
      if($localStorage.editDojoListing.coordinates) $scope.dojo.coordinates = $localStorage.editDojoListing.coordinates;
      if($localStorage.editDojoListing.needMentors) $scope.dojo.needMentors = $localStorage.editDojoListing.needMentors;
      if($localStorage.editDojoListing.stage) $scope.dojo.stage = $localStorage.editDojoListing.stage;
      if($localStorage.editDojoListing.private) $scope.dojo.private = $localStorage.editDojoListing.private;
      if($localStorage.editDojoListing.googleGroup) $scope.dojo.googleGroup = $localStorage.editDojoListing.googleGroup;
      if($localStorage.editDojoListing.website) $scope.dojo.website = $localStorage.editDojoListing.website;
      if($localStorage.editDojoListing.twitter) $scope.dojo.twitter = $localStorage.editDojoListing.twitter;
      if($localStorage.editDojoListing.supporterImage) $scope.dojo.supporterImage = $localStorage.editDojoListing.supporterImage;
      if($localStorage.editDojoListing.mailingList) $scope.dojo.mailingList = $localStorage.editDojoListing.mailingList;
    }
  }

  cdCountriesService.listCountries(function(countries) {
    $scope.countries = countries;
  });

  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
  }

  $scope.setCountry = function(dojo, country) {
    dojo.countryName = country.countryName;
    dojo.countryNumber = country.countryNumber;
    dojo.continent = country.continent;
    dojo.alpha2 = country.alpha2;
    dojo.alpha3 = country.alpha3;
  };

  $scope.setPlace = function(dojo, place) {
    dojo.placeName = place.name;
    dojo.placeGeonameId = place.geonameId;
    dojo.county = {};
    dojo.state = {};
    dojo.city = {};
    for (var adminidx=1; adminidx<=4; adminidx++) {
      dojo['admin'+ adminidx + 'Code'] = place['admin'+ adminidx + 'Code'];
      dojo['admin'+ adminidx + 'Name'] = place['admin'+ adminidx + 'Name'];
    }
  };

  $scope.updateLocalStorage = function (localObj, item, value) {
    if($state.current.name === "edit-dojo") localObj = "editDojoListing";
    if(!$localStorage[localObj]) $localStorage[localObj] = {};
    if(typeof value === 'undefined') value = false;
    $localStorage[localObj][item] = value;
  }

  var deleteLocalStorage = function (localObj) {
    if($state.current.name === "edit-dojo") localObj = "editDojoListing";
    delete $localStorage[localObj];
    console.log($localStorage);
  }

  var sanitizeCdForms = {
    editDojo: ["address1","email","googleGroup","name","needMentors","notes","supporterImage","time","twitter","website"]
  }

  $scope.save = function(dojo) {
    canUpdateDojo().then(function (isDojoAdmin) {
      if(isDojoAdmin) {
        _.each(sanitizeCdForms.editDojo, function(item, i) {
          if(_.has(dojo, item)) {
            dojo[item] = $sanitize(dojo[item]);
          }
        });

        dojo.emailSubject = $translate.instant('We created a new Google Email for your Dojo');
        cdDojoService.save(dojo, function(response) {
          if(($scope.founder.id !== ($scope.prevFounder && $scope.prevFounder.id))){
            cdDojoService.updateFounder($scope.founder, function(response){
              alertService.showAlert($translate.instant("Your Dojo has been successfully saved"), function() {
                deleteLocalStorage('editDojoListing');
                $state.go('my-dojos');
                $scope.$apply();
              });
            }, function(err){
              alertService.showError($translate.instant('An error has occurred while saving'));
            });
          } else {
            alertService.showAlert($translate.instant("Your Dojo has been successfully saved"), function() {
              deleteLocalStorage('editDojoListing');
              $state.go('my-dojos');
              $scope.$apply();
            });
          }

        }, function(err) {
          alertService.showError(
            $translate.instant('An error has occurred while saving') + ': <br /> '+
            (err.error || JSON.stringify(err))
          );
        });
      } else {
        alertService.showAlert($translate.instant('You do not have permission to update this Dojo.'));
      }
    });
  }

  $scope.addMarker = function($event, $params, dojo) {
    angular.forEach($scope.markers, function(marker) {
      marker.setMap(null);
    });
    $scope.markers.push(new google.maps.Marker({
      map: $scope.model.map,
      position: $params[0].latLng
    }));
    dojo.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
  };

  $scope.getLocationFromAddress = function(dojo) {
    if(dojo) {
      if(!dojo.address1) dojo.address1 = '';
      if(!dojo.address2) dojo.address2 = '';
      if(!dojo.city) dojo.city = '';
      if(!dojo.county) dojo.county = '';
      if(!dojo.state) dojo.state = '';
      if(!dojo.country)  dojo.country  = '';
      var address = dojo.city.toponymName + ', ' + dojo.county.toponymName + ', ' + dojo.state.toponymName + ', ' + dojo.country.countryName;
      Geocoder.latLngForAddress(address).then(function (data) {
        $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
        $scope.model.map.panTo($scope.mapOptions.center);
      });
    }
  }

  function canUpdateDojo() {
    var deferred = $q.defer();
    var query = {userId: currentUser.data.id, dojoId: $state.params.id};
    var isCDFAdmin = _.contains(currentUser.data.roles, 'cdf-admin');
    if(isCDFAdmin) {
      deferred.resolve(isCDFAdmin);
    } else {
      cdDojoService.getUsersDojos(query, function (userDojo) {
        var isDojoAdmin = _.find(userDojo[0].userPermissions, function (userPermission) {
          return userPermission.name === 'dojo-admin';
        });
        deferred.resolve(isDojoAdmin);
      }, function (err) {
        deferred.reject(err);
      });  
    }
    return deferred.promise;
  }

  $scope.editorOptions = {
    language: 'en',
    uiColor: '#000000',
    height:'200px'
  };

}

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', '$window', '$location', 'cdDojoService', 'cdCountriesService', 'alertService', 'Geocoder', 'gmap', 'auth', 
    '$state', '$q', '$translate', '$sanitize', 'utilsService', 'currentUser', 'cdUsersService', '$localStorage', cdEditDojoCtrl]);

