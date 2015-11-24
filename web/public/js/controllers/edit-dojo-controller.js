'use strict';
/* global google */

function cdEditDojoCtrl($scope, cdDojoService, alertService, gmap, auth,
                        $state, $q, $translate, utilsService, currentUser, cdUsersService, $localStorage, $ngBootbox) {

  canUpdateDojo().then(function(isDojoAdmin){
    if(!isDojoAdmin){
      $scope.isDojoAdmin = isDojoAdmin;
      $state.go('error-404-no-headers');
    }
  });

  $scope.dojo = {};
  $scope.model = {};
  $scope.markers = [];
  $scope.markerPlaced = false;
  $scope.buttonText = $translate.instant('Update Dojo');
  $scope.hideUserSelect = true;
  $scope.changedLocation = false;
  $scope.disableDojoCountryChange = false;

  $scope.isCDFAdmin = currentUser && currentUser.data && _.contains(currentUser.data.roles, 'cdf-admin');

  var DEFAULT_COORDS = '53.3478,6.2597';

  auth.get_loggedin_user(function (user) {
    $scope.user = user;
  });

  cdDojoService.getDojoConfig(function (json) {
    $scope.dojoStages = _.map(json.dojoStages, function (item) {
      return {value: item.value, label: $translate.instant(item.label)};
    });
  });

  $scope.noop = angular.noop;

  $scope.toggleUserSelect = function (event) {
    $scope.hideUserSelect = !$scope.hideUserSelect;
  };

  $scope.scrollToInvalid = function (form) {
    if (form.$invalid) {
      angular.element('form[name=' + form.$name + '] .ng-invalid')[0].scrollIntoView();
    }
  };

  async.waterfall([function (done) {
    var dojoId = $state.params.id;

    cdDojoService.load(dojoId, function (response) {
      if (!_.isEmpty(response)) {
        return done(null, response);
      } else {
        return done($translate.instant('Failed to load Dojo'));
      }
    });
  }, function (dojo, done) {
    var query = {};

    query.dojoId = dojo.id;

    query.owner = 1;

    cdDojoService.getUsersDojos(query, function (response) {

      return done(null, dojo, response[0]);
    }, function () {
      return done($translate.instant('Failed to load Dojo'));
    });


  }, function (dojo, prevFounder, done) {

    if (_.isEmpty(prevFounder)) {
      return done(null, dojo);
    }

    cdUsersService.loadPrevFounder(prevFounder.userId, function(response){
      prevFounder.email = response.email;
      prevFounder.name = response.name;

      return done(null, dojo, prevFounder);
    }, function (err) {
      return done(err);
    });
  }], function (err, dojo, prevFounder) {
    if (err) {
      alertService.showError(err);
      return;
    }

    var initContent = "<p>" +
      $translate.instant('Suggested Notes:') + "<br><br>" + $translate.instant('Please bring:') +
      "<ul><li>" + $translate.instant('A pack lunch.') + "</li>" +
      "<li>" + $translate.instant('A laptop. Borrow one from somebody if needs be.') + "</li>" +
      "<li><b>" + $translate.instant('A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.') + "</b></li>" +
      "</ul></p>";

    $scope.editorOptions = {
      language: 'en',
      uiColor: '#000000',
      height: '200px'
    };
    if (dojo.notes === '') $scope.editorOptions.initContent = initContent;

    $scope.originalDojoListing = angular.copy(dojo);
    $scope.dojo = dojo;
    $scope.disableDojoCountryChange = dojo.verified === 1;
    $scope.prevFounder = prevFounder;
    $scope.founder = angular.copy(prevFounder);
    loadDojoMap();
    updateFromLocalStorage();
  });

  $scope.getUsersByEmails = function (email) {
    if (!email || !email.length || email.length < 3) {
      $scope.users = [];
      return;
    }

    var win = function (users) {
      $scope.users = users;
    };

    var fail = function () {
      alertService.showError($translate.instant('An error has occurred while loading Dojos'));
    };

    cdUsersService.getUsersByEmails(email, win, fail);
  };

  $scope.setFounder = function (founder) {
    if (founder) {
      $scope.founder = founder;
      $scope.founder.previousFounderId = $scope.prevFounder.userId;
      $scope.founder.dojoId = $scope.dojo.id;
    }
  };

  function loadDojoMap() {
    $scope.$watch('model.map', function (map) {
      if (map) {
        var marker = new google.maps.Marker({
          map: $scope.model.map,
          position: new google.maps.LatLng(latitude, longitude)
        });
        $scope.markers.push(marker);
      }
    });

    if (gmap) {
      $scope.mapLoaded = true;

      var coordsStr = $scope.dojo.coordinates;

      if (!coordsStr) {
        coordsStr = DEFAULT_COORDS;
      }

      var coordinates = coordsStr.split(',');
      var latitude = coordinates[0];
      var longitude = coordinates[1];

      if (!isNaN(utilsService.filterFloat(latitude)) && !isNaN(utilsService.filterFloat(latitude))) {
        $scope.mapOptions = {
          center: new google.maps.LatLng(latitude, longitude),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      } else if ($scope.dojo.geoPoint && $scope.dojo.geoPoint.lat && $scope.dojo.geoPoint.lon) {
        //add map using coordinates from geopoint if possible
        $scope.mapOptions = {
          center: new google.maps.LatLng($scope.dojo.geoPoint.lat, $scope.dojo.geoPoint.lon),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      } else { //add empty map
        cdDojoService.loadCountriesLatLongData(function (countries) {
          var country = countries[$scope.dojo.alpha2];
          $scope.mapOptions = {
            center: new google.maps.LatLng(country[0], country[1]),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
        })
      }
    }
    $scope.dojoPageReady = true;
  }

  function updateFromLocalStorage() {
    if ($localStorage[$scope.user.id] && $localStorage[$scope.user.id].editDojo && $localStorage[$scope.user.id].editDojo[$scope.dojo.id] && $scope.isDojoAdmin) {
      alertService.showAlert($translate.instant('There are unsaved changes on this page'));
      var lsed = $localStorage[$scope.user.id].editDojo[$scope.dojo.id];
      if (lsed.name) $scope.dojo.name = lsed.name;
      if (lsed.email) $scope.dojo.email = lsed.email;
      if (lsed.time) $scope.dojo.time = lsed.time;
      if (lsed.country) {
        $scope.dojo.country = lsed.country;
        $scope.setCountry($scope.dojo, lsed.country);
      }
      if (lsed.place) {
        $scope.dojo.place = lsed.place;
        $scope.setPlace($scope.dojo, lsed.place);
      }
      if (lsed.country && lsed.place) {
        $scope.getLocationFromAddress();
      }
      if (lsed.address1) $scope.dojo.address1 = lsed.address1;
      if (lsed.coordinates) $scope.dojo.coordinates = lsed.coordinates;
      if (lsed.needMentors) $scope.dojo.needMentors = lsed.needMentors;
      if (lsed.stage) $scope.dojo.stage = lsed.stage;
      if (lsed.private) $scope.dojo.private = lsed.private;
      if (lsed.googleGroup) $scope.dojo.googleGroup = lsed.googleGroup;
      if (lsed.website) $scope.dojo.website = lsed.website;
      if (lsed.twitter) $scope.dojo.twitter = lsed.twitter;
      if (lsed.supporterImage) $scope.dojo.supporterImage = lsed.supporterImage;
      if (lsed.mailingList) $scope.dojo.mailingList = lsed.mailingList;
    }
  }

  cdDojoService.listCountries(function (countries) {
    $scope.countries = countries;
  });

  $scope.getPlaces = function (countryCode, $select) {
    return utilsService.getPlaces(countryCode, $select).then(function (data) {
      $scope.places = data;
    }, function (err) {
      $scope.places = [];
      console.error(err);
    });
  };

  $scope.setCountry = function (dojo, country) {
    dojo.countryName = country.countryName;
    dojo.countryNumber = country.countryNumber;
    dojo.continent = country.continent;
    dojo.alpha2 = country.alpha2;
    dojo.alpha3 = country.alpha3;
  };

  $scope.setPlace = function (dojo, place, form) {
    if(place.nameWithHierarchy.length > 40) {
      if(form) form.place.$setValidity("maxLength", false);
    } else {
      if(form) form.place.$setValidity("maxLength", true);
    }
    dojo.placeName = place.name || place.nameWithHierarchy;
    dojo.placeGeonameId = place.geonameId;
    dojo.county = {};
    dojo.state = {};
    dojo.city = {};
    for (var adminidx = 1; adminidx <= 4; adminidx++) {
      dojo['admin' + adminidx + 'Code'] = place['admin' + adminidx + 'Code'];
      dojo['admin' + adminidx + 'Name'] = place['admin' + adminidx + 'Name'];
    }
  };

  $scope.clearPlace = function (dojo) {
    dojo.placeName = "";
    dojo.placeGeonameId = "";
    dojo.county = {};
    dojo.state = {};
    dojo.city = {};
    for (var adminidx = 1; adminidx <= 4; adminidx++) {
      dojo['admin' + adminidx + 'Code'] = "";
      dojo['admin' + adminidx + 'Name'] = "";
    }
    $scope.dojo.place = "";
  };

  $scope.updateLocalStorage = function (localObj, item, value) {
    if (['address1', 'place'].indexOf(item) > -1) {
      $scope.changedLocation = true;
      $scope.setPlace($scope.dojo, $scope.dojo.place);
    }

    if ($scope.user && $state.current.name === "edit-dojo") {
      localObj = $scope.dojo.id;
      if (!$localStorage[$scope.user.id]) $localStorage[$scope.user.id] = {};
      if (!$localStorage[$scope.user.id].editDojo) $localStorage[$scope.user.id].editDojo = {};
      if (!$localStorage[$scope.user.id].editDojo[localObj]) $localStorage[$scope.user.id].editDojo[localObj] = {};
      if (typeof value === 'undefined') value = false;
      $localStorage[$scope.user.id].editDojo[localObj][item] = value;
    }
  };

  var deleteLocalStorage = function (localObj) {
    if ($scope.user && $state.current.name === "edit-dojo") {
      if ($localStorage[$scope.user.id] && $localStorage[$scope.user.id].editDojo && $localStorage[$scope.user.id].editDojo[$scope.dojo.id]) {
        delete $localStorage[$scope.user.id].editDojo[$scope.dojo.id]
      }
    }
  };

  $scope.save = function (dojo) {

    if ($scope.changedLocation && !$scope.markerPlaced) {
      $scope.getLocationFromAddress(finish);
    } else {
      finish();
    }

    function saveDojo() {

      dojo.emailSubject = $translate.instant('We created a new Google Email for your Dojo');
      dojo.editDojoFlag = true;
      cdDojoService.save(dojo, function (response) {
        if ($scope.founder && ($scope.founder.id !== ($scope.prevFounder && $scope.prevFounder.id))) {
          cdDojoService.updateFounder($scope.founder, function (response) {
            alertService.showAlert($translate.instant("Your Dojo has been successfully saved"), function () {
              deleteLocalStorage('editDojoListing');
              $state.go('manage-dojos');
              $scope.$apply();
            });
          }, function (err) {
            alertService.showError($translate.instant('An error has occurred while saving'));
          });
        } else {
          alertService.showAlert($translate.instant("Your Dojo has been successfully saved"), function () {
            deleteLocalStorage('editDojoListing');
            $state.go('my-dojos');
            $scope.$apply();
          });
        }
      }, function (err) {
        alertService.showError(
          $translate.instant('An error has occurred while saving') + ': <br /> ' +
          (err.error || JSON.stringify(err))
        );
      });
    }

    function finish() {
      canUpdateDojo().then(function (isDojoAdmin) {
        if (isDojoAdmin) {
          if($scope.originalDojoListing.alpha2 !== $scope.dojo.alpha2 ||
            $scope.originalDojoListing.admin1Name !== $scope.dojo.admin1Name ||
            $scope.originalDojoListing.placeName !== $scope.dojo.placeName ||
            $scope.originalDojoListing.name !== $scope.dojo.name){


            var options = {
              message: $translate.instant('By changing one of the following: Dojo Name, Country, City/Town, your dojo public url will be changed. Do you agree with this?'),
              title: $translate.instant('Confirmation'),
              buttons: {
                success: {
                  label: $translate.instant('Yes'),
                  className: "btn-primary",
                  callback: function() {
                    saveDojo();
                  }
                },
                warning: {
                  label: $translate.instant('No'),
                  className: "btn-warning",
                  callback: function() {
                  }
                }
              }
            };

            $ngBootbox.customDialog(options);
          } else{
            saveDojo();
          }

        } else {
          alertService.showAlert($translate.instant('You do not have permission to update this Dojo.'));
        }
      });
    }
  };

  $scope.addMarker = function ($event, $params, dojo) {
    $scope.markerPlaced = true;
    angular.forEach($scope.markers, function (marker) {
      marker.setMap(null);
    });
    $scope.markers.push(new google.maps.Marker({
      map: $scope.model.map,
      position: $params[0].latLng
    }));
    dojo.coordinates = $params[0].latLng.lat() + ', ' + $params[0].latLng.lng();
  };

  $scope.getLocationFromAddress = function (cb) {
    var dojo = $scope.dojo;
    utilsService.getLocationFromAddress(dojo).then(function (data) {
      $scope.mapOptions.center = new google.maps.LatLng(data.lat, data.lng);
      $scope.model.map.panTo($scope.mapOptions.center);
      angular.forEach($scope.markers, function (marker) {
        marker.setMap(null);
      });
      $scope.markers.push(new google.maps.Marker({
        map: $scope.model.map,
        position: $scope.mapOptions.center
      }));
      dojo.coordinates = data.lat + ', ' + data.lng;
      if (_.isFunction(cb)) cb();
    }, function () {
      //Ask user to add location manually if google geocoding can't find location.
      if (!_.isFunction(cb)) alertService.showError($translate.instant('Please add your location manually by clicking on the map.'));
      if (_.isFunction(cb)) cb();
    });
  };

  function canUpdateDojo() {
    var deferred = $q.defer();
    var query = {userId: currentUser.data.id, dojoId: $state.params.id};
    var isCDFAdmin = _.contains(currentUser.data.roles, 'cdf-admin');
    if (isCDFAdmin) {
      deferred.resolve(isCDFAdmin);
    } else {
      cdDojoService.getUsersDojos(query, function (userDojo) {
        if(!userDojo || userDojo.length < 1){ return deferred.resolve(false); }

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
}

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', 'cdDojoService', 'alertService', 'gmap', 'auth',
    '$state', '$q', '$translate', 'utilsService', 'currentUser', 'cdUsersService', '$localStorage', '$ngBootbox', cdEditDojoCtrl]);

