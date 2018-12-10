'use strict';
/* global google */

function cdEditDojoCtrl ($scope, dojo, cdDojoService, alertService, gmap, auth,
                        $state, $q, $translate, utilsService, currentUser, cdUsersService,
                        $localStorage, $ngBootbox, dojoUtils) {

  dojoUtils.isHavingPerm(currentUser.data, $state.params.id, 'dojo-admin').then(function (isDojoAdmin) {
    $scope.isDojoAdmin = isDojoAdmin;
  })
  .catch(function () {
    $scope.isDojoAdmin = false;
    $state.go('error-404-no-headers');
  });

  dojoUtils.isHavingPerm(currentUser.data, dojo.id, 'ticketing-admin')
  .then(function () {
    $scope.isTicketingAdmin = true;
  })
  .catch(function () {
    $scope.isTicketingAdmin = false;
  });

  $scope.getIsDojoAdmin = function () {
    return $scope.isDojoAdmin;
  };


  $scope.dojo = dojo;
  $scope.model = { markers: [] };
  $scope.markerPlaced = false;
  $scope.buttonText = $translate.instant('Update Dojo');
  $scope.hideUserSelect = true;
  $scope.changedLocation = false;
  $scope.disableDojoCountryChange = false;
  $scope.dojoImageUrl = $scope.dojoImageUrl || 'https://s3-eu-west-1.amazonaws.com/zen-dojo-images/';
  $scope.isCDFAdmin = currentUser && currentUser.data && _.includes(currentUser.data.roles, 'cdf-admin');
  $scope.times = {};
  $scope.times.startTime = moment(dojo.startTime, 'HH:mm').isValid() ? moment(dojo.startTime, 'HH:mm').toDate() : moment({minutes: 0}).toDate();
  $scope.times.endTime = moment(dojo.endTime, 'HH:mm').isValid() ? moment(dojo.endTime, 'HH:mm').toDate() : moment({minutes: 0}).toDate();
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
    var query = {};

    query.dojoId = $scope.dojo.id;

    query.owner = 1;

    cdDojoService.getUsersDojos(query, function (response) {

      return done(null, response[0]);
    }, function () {
      return done($translate.instant('Failed to load Dojo'));
    });
  }, function (prevFounder, done) {
    if (_.isEmpty(prevFounder) || !$scope.isCDFAdmin) {
      return done();
    }
    
    cdUsersService.loadPrevFounder(prevFounder.userId, function(response){
      prevFounder.email = response.email;
      prevFounder.name = response.name;
      $scope.prevFounder = prevFounder;
      $scope.founder = angular.copy(prevFounder);

      return done(null, prevFounder);
    }, function (err) {
      return done(err);
    });
  }], function (err, prevFounder) {
    if (err) {
      alertService.showError(err);
      return;
    }

    var initContent = "<p>" +
      $translate.instant('Suggested Notes:') + "<br><br>" + $translate.instant('Please bring:') +
      "<ul><li>" + $translate.instant('A laptop. Borrow one from somebody if needs be.') + "</li>" +
      "<li><b>" + $translate.instant('A parent! (Very important). If you are 12 or under, your parent must stay with you during the session.') + "</b></li>" +
      "</ul></p>";

    $scope.editorOptions = utilsService.getCKEditorConfig({});
    if ($scope.dojo.notes === '') $scope.editorOptions.initContent = initContent;

    $scope.originalDojoListing = angular.copy($scope.dojo);
    $scope.disableDojoCountryChange = ($scope.dojo.verified && !$scope.isCDFAdmin) === true;
    updateFromLocalStorage();
    loadDojoMap();
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
  function loadDojoMap () {
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
        $scope.addMarker(null, [{latLng: $scope.mapOptions.center}]);
      } else if ($scope.dojo.geoPoint && $scope.dojo.geoPoint.lat && $scope.dojo.geoPoint.lon) {
        //add map using coordinates from geopoint if possible
        $scope.mapOptions = {
          center: new google.maps.LatLng($scope.dojo.geoPoint.lat, $scope.dojo.geoPoint.lon),
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.addMarker(null, [{latLng: $scope.mapOptions.center}]);
      } else { // add empty map
        cdDojoService.loadCountriesLatLongData(function (countries) {
          var country = countries[$scope.dojo.alpha2];
          $scope.mapOptions = {
            center: new google.maps.LatLng(country[0], country[1]),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
        });
      }
    }
    $scope.dojoPageReady = true;
  }

  function updateFromLocalStorage () {
    if ($localStorage[$scope.user.id] && $localStorage[$scope.user.id].editDojo && $localStorage[$scope.user.id].editDojo[$scope.dojo.id] && $scope.isDojoAdmin) {
      alertService.showAlert($translate.instant('There are unsaved changes on this page'));
      var lsed = $localStorage[$scope.user.id].editDojo[$scope.dojo.id];
      if (lsed.name) $scope.dojo.name = lsed.name;
      if (lsed.email) $scope.dojo.email = lsed.email;
      if (lsed.time) $scope.dojo.time = lsed.time;
      if (lsed.needMentors) $scope.dojo.needMentors = lsed.needMentors;
      if (lsed.stage) $scope.dojo.stage = lsed.stage;
      if (lsed.private) $scope.dojo.private = lsed.private;
      if (lsed.googleGroup) $scope.dojo.googleGroup = lsed.googleGroup;
      if (lsed.website) $scope.dojo.website = lsed.website;
      if (lsed.twitter) $scope.dojo.twitter = lsed.twitter;
      if (lsed.facebook) $scope.dojo.facebook = lsed.facebook;
      if (lsed.supporterImage) $scope.dojo.supporterImage = lsed.supporterImage;
      if (lsed.mailingList) $scope.dojo.mailingList = lsed.mailingList;
      if (lsed.markerPlaced) $scope.markerPlaced = lsed.markerPlaced;
    }
  }

  $scope.clearPlace = function (dojo) {
    dojo.placeName = '';
    dojo.placeGeonameId = '';
    dojo.county = {};
    dojo.state = {};
    dojo.city = {};
    for (var adminidx = 1; adminidx <= 4; adminidx++) {
      dojo['admin' + adminidx + 'Code'] = '';
      dojo['admin' + adminidx + 'Name'] = '';
    }
    $scope.dojo.place = '';
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
    if ($scope.user && $state.current.name === 'edit-dojo') {
      if ($localStorage[$scope.user.id] && $localStorage[$scope.user.id].editDojo && $localStorage[$scope.user.id].editDojo[$scope.dojo.id]) {
        delete $localStorage[$scope.user.id].editDojo[$scope.dojo.id];
      }
    }
  };

  $scope.save = function (dojo) {
    dojo.placeName = dojo.place.nameWithHierarchy || dojo.place.toponymName || dojo.place.name;
    if ($scope.changedLocation && !$scope.markerPlaced) {
      $scope.getLocationFromAddress(finish);
    } else {
      finish();
    }

    function saveDojo () {
      var lDojo = _.clone(dojo);
      delete lDojo.eventbriteConnected;
      lDojo.startTime = moment($scope.times.startTime).isValid() ? moment($scope.times.startTime).format('HH:mm') : null;
      lDojo.endTime = moment($scope.times.endTime).isValid() ? moment($scope.times.endTime).format('HH:mm') : null;
      cdDojoService.save(lDojo, function (response) {
        if ($scope.founder && ($scope.founder.id !== ($scope.prevFounder && $scope.prevFounder.id))) {
          cdDojoService.updateFounder({ id: $scope.founder.id, previousFounderId: $scope.founder.previousFounderId, dojoId: $scope.founder.dojoId },
            function (response) {
            alertService.showAlert($translate.instant('Your Dojo has been successfully saved'), function () {
              deleteLocalStorage('editDojoListing');
              $state.go('manage-dojos');
              $scope.$apply();
            });
          }, function (err) {
            alertService.showError($translate.instant('An error has occurred while saving'));
          });
        } else {
          alertService.showAlert($translate.instant('Your Dojo has been successfully saved'), function () {
            deleteLocalStorage('editDojoListing');
            $state.go('my-dojos');
            $scope.$apply();
          });
        }
      }, function (err) {
        err = err.data || err;
        alertService.showError(
          $translate.instant('An error has occurred while saving') + ': <br />' +
          (err.error || JSON.stringify(err))
        );
      });
    }

    function finish() {
      dojoUtils.isHavingPerm(currentUser.data, $state.params.id, 'dojo-admin').then(function (isDojoAdmin) {
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
      })
      .catch(function(){
        alertService.showAlert($translate.instant('You do not have permission to update this Dojo.'));
      });
    }
  };

  $scope.upload = function (file) {
    return cdDojoService.uploadAvatar($scope.dojo.id, file)
    .then(function(){
      return 'https://s3-eu-west-1.amazonaws.com/zen-dojo-images/' + $scope.dojo.id;
    });
  }
}

angular.module('cpZenPlatform')
  .controller('edit-dojo-controller', ['$scope', 'dojo', 'cdDojoService', 'alertService', 'gmap', 'auth',
    '$state', '$q', '$translate', 'utilsService', 'currentUser', 'cdUsersService', '$localStorage', '$ngBootbox', 'dojoUtils',
     cdEditDojoCtrl]);
